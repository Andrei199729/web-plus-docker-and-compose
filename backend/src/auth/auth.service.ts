import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/types/types';
import { EntityNotFoundError } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async compareUsername(
    inputUsername: string,
    dbUsername: string,
  ): Promise<boolean> {
    return inputUsername.toLowerCase() === dbUsername.toLowerCase();
  }

  async validateUser(username: string, password: string) {
    try {
      const user = await this.usersService.getUserByUsername(username);

      if (!user) {
        throw new UnauthorizedException('Не правильный юзернейм!');
      }

      const userIsMatch = await this.compareUsername(username, user.username);
      const passwordIsMatch = await bcrypt.compare(password, user.password);

      if (passwordIsMatch) {
        return user;
      } else if (!userIsMatch) {
        throw new UnauthorizedException('Не правильный юзернейм!');
      } else {
        throw new UnauthorizedException('Не правильный пароль!');
      }
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new UnauthorizedException(error.message);
      } else {
        return error;
      }
    }
  }

  async login(user: IUser) {
    const { id, username } = user;
    return {
      id,
      username,
      access_token: this.jwtService.sign({
        id: user.id,
        username: user.username,
      }),
    };
  }
}
