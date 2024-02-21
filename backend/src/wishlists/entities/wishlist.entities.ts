import { IsUrl, MaxLength, MinLength } from 'class-validator';
import { User } from 'src/users/entities/user.entities';
import { Wish } from 'src/wishes/entities/wish.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 'Мой вишлист' })
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @Column()
  @IsUrl({}, { message: 'Невалидный URL' })
  image: string;

  @ManyToMany(() => Wish, (wish) => wish.wishlist)
  @JoinTable()
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists)
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
