import {
  IsNumber,
  IsPositive,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Offer } from 'src/offers/entities/offer.entities';
import { User } from 'src/users/entities/user.entities';
import { Wishlist } from 'src/wishlists/entities/wishlist.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @Column()
  link: string;

  @Column()
  @IsUrl({}, { message: 'Невалидный URL' })
  image: string;

  @Column()
  @IsNumber()
  @IsPositive()
  @Min(0)
  price: number;

  @Column()
  @IsNumber()
  @IsPositive()
  @Min(0)
  raised: number | null;

  @ManyToOne(() => User, (user) => user.wishes)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  @MinLength(1)
  @MaxLength(1024)
  description: string;

  @OneToMany(() => Offer, (offer) => offer.item)
  @JoinTable()
  offers: Offer[];

  @Column({ default: 0 })
  copied: number;

  @ManyToMany(() => Wishlist, (wishlist) => wishlist.items)
  wishlist: Wishlist[];
}
