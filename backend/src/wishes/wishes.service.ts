import { BadRequestException, Injectable } from '@nestjs/common';
import { Wish } from './entities/wish.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from 'src/users/entities/user.entities';
import { validate } from 'class-validator';

@Injectable()
export class WishesService {
  name: string;
  link: string;
  image: string;
  price: number;
  description: string;
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createWishDto: CreateWishDto, id: number) {
    const wish = await this.validate(createWishDto);

    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new BadRequestException(`Пользователь с таким id ${id} не найден!`);
    }

    wish.owner = user;
    wish.raised = 0;

    return await this.wishRepository.save(wish);
  }

  private async validate(createWishDto: CreateWishDto) {
    try {
      const wish = new Wish();
      for (const field in createWishDto) {
        if (!createWishDto[field]) {
          throw new BadRequestException(`Поле "${field}" не может быть пустым`);
        }
        wish[field] = createWishDto[field];
      }
      await validate(wish);
      return wish;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }

  async getWishesLast() {
    return await this.wishRepository.find({
      order: {
        updatedAt: 'DESC',
      },
      skip: 0,
      take: 40,
    });
  }

  async getWishesTop() {
    return await this.wishRepository.find({
      order: {
        updatedAt: 'ASC',
      },
      skip: 0,
      take: 10,
    });
  }

  async getfindByWishes(id: number) {
    return await this.wishRepository.findOne({
      where: { id },
      relations: { owner: true, offers: true },
    });
  }

  async patchUpdateByWishes(
    id: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ) {
    try {
      const existingWish = await this.wishRepository.findOneOrFail({
        where: { id },
        relations: ['owner'],
      });

      if (existingWish.owner.id !== userId) {
        throw new BadRequestException(`Нельзя изменить чужой подарок!`);
      }

      const updateWish = await this.validate(updateWishDto);

      await this.wishRepository.update(id, {
        ...existingWish,
        ...updateWish,
      });

      return await this.wishRepository.findOneBy({ id });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(`Подарок с id ${id} не найден`);
      } else {
        throw error;
      }
    }
  }

  async deleteOneWish(id: number) {
    try {
      const existingWish = await this.wishRepository.findOneOrFail({
        where: { id },
        relations: ['owner'],
      });
      if (!existingWish) {
        throw new BadRequestException(`Подарок с id ${id} не найден`);
      }
      await this.wishRepository.delete(id);
      return { message: `Подарок с id ${id} успешно удален` };
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }

  async postCopyWish(id: number, userId: number) {
    try {
      const existingWish = await this.wishRepository.findOne({
        where: { id },
      });
      if (!existingWish)
        throw new BadRequestException(`Подарок с id ${id} не найден`);
      const user = await this.userRepository.findOne({
        relations: {
          wishes: true,
        },
        where: { id: userId },
      });

      const isWishHas = user.wishes.some(
        (item) => item.id === existingWish.id && item.copied === 1,
      );

      if (!isWishHas) {
        const newWish = this.wishRepository.create(existingWish);
        newWish.copied = 0;
        newWish.raised = 0;
        newWish.owner = user;
        const isOriginalWishNotCopied = existingWish.copied === 0;
        if (isOriginalWishNotCopied) {
          await this.wishRepository.save({ ...existingWish, copied: 1 });
          await this.wishRepository.insert(newWish);
          return user;
        } else {
          throw new BadRequestException(
            `Подарок с id ${id} уже был скопирован`,
          );
        }
      }
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }
}
