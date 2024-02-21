import { Module } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entities';
import { Wish } from 'src/wishes/entities/wish.entities';
import { User } from 'src/users/entities/user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, User, Wish])],
  providers: [WishlistsService],
  controllers: [WishlistsController],
  exports: [WishlistsService],
})
export class WishlistsModule {}
