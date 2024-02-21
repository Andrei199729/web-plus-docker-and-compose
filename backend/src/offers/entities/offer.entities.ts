import { IsBoolean } from 'class-validator';
import { User } from 'src/users/entities/user.entities';
import { Wish } from 'src/wishes/entities/wish.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  itemId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.offers)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers)
  @JoinColumn({ name: 'item_id' })
  item: Wish;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ default: true })
  @IsBoolean()
  hidden: boolean;
}
