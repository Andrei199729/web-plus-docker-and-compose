import { Module } from '@nestjs/common';
import { WishesService } from './wishes.service';
import { WishesController } from './wishes.controller';
import { Wish } from './entities/wish.entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Wish, User])],
  providers: [WishesService],
  controllers: [WishesController],
  exports: [WishesService],
})
export class WishesModule {}
