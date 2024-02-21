import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { validate } from 'class-validator';
import { User } from 'src/users/entities/user.entities';
import { Wish } from 'src/wishes/entities/wish.entities';

@Injectable()
@UseGuards(JwtAuthGuard)
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async postCreateOffers(createOfferDto: CreateOfferDto, id: number) {
    try {
      const { itemId, amount } = createOfferDto;
      const offer = await this.validate(createOfferDto);

      const user = await this.userRepository.findOne({
        where: { id },
        relations: { wishes: true },
      });

      const wish = await this.wishRepository.findOneBy({ id: itemId });
      if (!wish)
        throw new BadRequestException(`Подарок с id ${itemId} не существует`);

      const isHashWidh = user.wishes.some((item) => item.id === user.id);

      if (!isHashWidh) {
        offer.user = user;
        offer.item = wish;
        wish.raised = Number(wish.raised) + amount;
        offer.amount = amount;
        if (wish.raised > wish.price) {
          throw new BadRequestException(
            'Сумма средств не должна превышать стоимость подарка',
          );
        }

        return this.wishRepository.manager.transaction(
          async (transactionalEntityManager) => {
            await transactionalEntityManager.increment(
              Wish,
              { id: itemId },
              'raised',
              amount,
            );

            await transactionalEntityManager.save(Wish, wish);
            return transactionalEntityManager.save(Offer, offer);
          },
        );
      } else {
        throw new BadRequestException('На свои подарки скидываться нельзя');
      }
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }

  private async validate(createOfferDto: CreateOfferDto) {
    try {
      const offer = new Offer();
      for (const key in createOfferDto) {
        if (!createOfferDto[key]) {
          throw new BadRequestException(`Поле "${key}" не может быть пустым`);
        }
        offer[key] = createOfferDto[key];
      }
      await validate(offer);
      return offer;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }

  async getfindAllOffers() {
    return await this.offerRepository.find({
      relations: ['user', 'item'],
    });
  }

  async getOfferById(itemId: number) {
    try {
      const offer = await this.offerRepository.find({
        where: { itemId },
        relations: ['user', 'item'],
      });

      if (!offer.length) {
        throw new BadRequestException(`Транзакация с id ${itemId} не найдена`);
      }
      return offer;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException(error.message);
      } else {
        return error;
      }
    }
  }
}
