import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'legacy_user_id', type: 'integer' })
  legacyUserId: number;

  @Column({ name: 'name', type: 'varchar', length: 45 })
  name: string;

  @OneToMany(() => Order, (order) => order.user, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  orders: Order[];
}
