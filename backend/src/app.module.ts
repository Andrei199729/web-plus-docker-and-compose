import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { WishesModule } from './wishes/wishes.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { OffersModule } from './offers/offers.module';
import { Wish } from './wishes/entities/wish.entities';
import { User } from './users/entities/user.entities';
import { Offer } from './offers/entities/offer.entities';
import { Wishlist } from './wishlists/entities/wishlist.entities';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    WishesModule,
    WishlistsModule,
    OffersModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        synchronize: true,
        entities: [Wish, User, Offer, Wishlist],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Wish, User, Offer, Wishlist]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
