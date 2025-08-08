import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'legacy_order_id', type: 'integer' })
  legacyOrderId: number;

  @Column({ type: 'text', name: 'date' })
  date: string;

  @Column({
    name: 'total',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  total: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Product, (product) => product.order, {
    cascade: ['insert', 'update', 'remove'],
    eager: false,
  })
  products: Product[];
}
