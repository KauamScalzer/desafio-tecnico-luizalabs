import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'legacy_product_id', type: 'integer' })
  legacyProductId: number;

  @Column({ name: 'value', type: 'decimal', precision: 12, scale: 2 })
  value: number;

  @Column({ name: 'order_id', type: 'integer' })
  orderId: number;

  @ManyToOne(() => Order, (order) => order.products, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
