import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Wishlist } from './entities/wishlist.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, In, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { User } from 'src/users/entities/user.entities';
import { Wish } from 'src/wishes/entities/wish.entities';
import { validate } from 'class-validator';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async postCreateWishlists(
    createWishlistDto: CreateWishlistDto,
    userId: number,
  ) {
    try {
      const { itemsId } = createWishlistDto;
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`Пользователь с id ${userId} не найден`);
      }

      const wishes = await this.wishRepository.find({
        where: { id: In(itemsId) },
      });

      const newWishlists = this.wishlistRepository.create({
        ...createWishlistDto,
        owner: user,
        items: wishes,
      });

      return await this.wishlistRepository.save(newWishlists);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(error.message);
      } else {
        return error;
      }
    }
  }

  private async validate(createWishlistDto: CreateWishlistDto) {
    try {
      const wishlist = new Wishlist();
      for (const key in createWishlistDto) {
        if (!createWishlistDto[key]) {
          throw new BadRequestException(`Поле "${key}" не может быть пустым`);
        }
        wishlist[key] = createWishlistDto[key];
      }
      await validate(wishlist);
      return wishlist;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }

  async getfindAllWishlists(): Promise<Wishlist[]> {
    return await this.wishlistRepository.find({
      relations: { owner: true, items: true },
    });
  }

  async getfindByWishlists(id: number): Promise<Wishlist> {
    try {
      const wishlist = await this.wishlistRepository.findOne({
        where: { id },
        relations: { owner: true, items: true },
      });

      if (!wishlist) {
        throw new BadRequestException(
          `Коллекция подарков с id ${id} не найдена`,
        );
      }
      return wishlist;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }

  async patchUpdateByWishlists(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    try {
      const { itemsId, name, image } = updateWishlistDto;

      const wishlist = await this.wishlistRepository.findOne({
        where: { id },
        relations: { owner: true, items: true },
      });

      if (!wishlist) {
        throw new NotFoundException(`Подборка с id ${id} не найдена`);
      }

      if (!name || !image || !itemsId) {
        throw new BadRequestException(
          'Необходимо заполнить все обязательные поля',
        );
      }

      wishlist.items = [];
      const updatedWishlistWithoutItems = await this.wishlistRepository.save(
        wishlist,
      );

      const items = await this.wishRepository.find({
        where: { id: In(updateWishlistDto.itemsId) },
      });

      const missingIds = updateWishlistDto.itemsId.filter(
        (itemId) => !items.some((item) => item.id === itemId),
      );

      if (missingIds.length > 0) {
        throw new BadRequestException(
          `Подарки с id ${missingIds.join(', ')} не найдены`,
        );
      }

      updatedWishlistWithoutItems.items = items;

      await this.wishlistRepository.save(updatedWishlistWithoutItems);
      if (wishlist.owner.id !== userId) {
        throw new ForbiddenException(
          'Вы не можете редактировать чужие списки подарков',
        );
      }
      return await this.wishlistRepository.findOne({
        where: { id },
        relations: { owner: true, items: true },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }

  async deleteByWishlists(id: number, userId: number) {
    try {
      const existingWishlist = await this.wishlistRepository.findOne({
        where: { id },
        relations: { owner: true },
      });
      if (!existingWishlist) {
        throw new BadRequestException(`Колекция с id ${id} не найден`);
      }

      if (existingWishlist.owner.id !== userId) {
        throw new ForbiddenException(
          'Вы не можете удалять чужие списки подарков',
        );
      }

      await this.wishlistRepository.delete(id);
      return { message: `Колекция с id ${id} успешно удалена ` };
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }
}
