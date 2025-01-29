import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

type Currency = 'USD' | 'EUR' | 'GBP';
@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  currency: Currency;

  @Column()
  balance: number;

  @Column()
  ownerId: number;

  @ManyToOne(() => User, (user) => user.wallets)
  owner: User;

  @Column()
  addedAt: Date;
}
