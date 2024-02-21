import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entities';
import { EntityNotFoundError, Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; access_token: string }> {
    const existUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existUser) {
      if (existUser.username === createUserDto.username) {
        throw new BadRequestException(
          'Пользователь с таким именем уже существует!',
        );
      } else if (existUser.email === createUserDto.email) {
        throw new BadRequestException(
          'Пользователь с такой почтой уже существует!',
        );
      }
    }

    const saltOrRounds = 10;
    const password = createUserDto.password;
    const hash = await bcrypt.hash(password, saltOrRounds);

    const user = await this.userRepository.save({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hash,
      about: createUserDto.about,
      avatar: createUserDto.avatar,
    });

    const access_token = this.jwtService.sign({
      username: createUserDto.username,
    });
    return { user, access_token };
  }

  getUserRequest(id: number) {
    try {
      const user = this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException('Пользователя не существует!');
      return user;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(error.message);
      } else {
        return error;
      }
    }
  }

  // реализовать
  async getUserRequestWishes(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        wishes: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.wishes;
  }

  async updateUserRequest(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (updateUserDto.username) {
        const isUsernameTaken = await this.userRepository.findOne({
          where: { username: updateUserDto.username, id: Not(id) },
        });

        if (isUsernameTaken) {
          throw new BadRequestException(
            'Пользователь с таким именем уже существует!',
          );
        }
      }

      if (updateUserDto.email) {
        const isEmailTaken = await this.userRepository.findOne({
          where: { email: updateUserDto.email, id: Not(id) },
        });

        if (isEmailTaken) {
          throw new BadRequestException(
            'Пользователь с таким email уже существует!',
          );
        }
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      if (!user) throw new NotFoundException('Пользователя не существует!');

      await this.userRepository.update(id, updateUserDto);

      const updatedUser = await this.userRepository.findOne({ where: { id } });

      return updatedUser;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }

  async getUserByUsername(username: string) {
    try {
      const user = await this.userRepository.findOne({ where: { username } });

      if (!user) {
        throw new NotFoundException(
          `Пользователь с именем '${username}' не найден`,
        );
      }
      return user;
    } catch (error) {
      throw new NotFoundException(
        `Пользователь с именем '${username}' не найден`,
      );
    }
  }

  async getUserByUsernameWishes(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: {
        wishes: true,
        offers: true,
      },
    });
    if (!user)
      throw new BadRequestException(
        `Пользователь с таким ${username} не найден`,
      );
    return user.wishes;
  }

  async findManyUsers(query: string) {
    return await this.userRepository.find({
      where: [{ username: query }, { email: query }],
    });
  }
}
