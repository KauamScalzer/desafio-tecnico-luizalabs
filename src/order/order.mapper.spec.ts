import { OrderMapper } from './order.mapper';
import { User } from './entities/user.entity';
import { Order } from './entities/order.entity';
import { Product } from './entities/product.entity';
import {
  UserOrderResponseDto,
  OrderResponseDto,
  ProductResponseDto,
} from './dto';

describe('OrderMapper', () => {
  let mapper: OrderMapper;

  beforeEach(() => {
    mapper = new OrderMapper();
  });

  it('should map empty user list to empty DTO array', () => {
    const result = mapper.toResponseDto([]);
    expect(result).toEqual([]);
  });

  it('should map users without orders to DTOs with empty orders array', () => {
    const users: User[] = [
      { legacyUserId: 1, name: 'Alice', orders: [] } as any,
    ];

    const expected: UserOrderResponseDto[] = [
      { user_id: 1, name: 'Alice', orders: [] },
    ];

    const result = mapper.toResponseDto(users);
    expect(result).toEqual(expected);
  });

  it('should map user with orders and products correctly', () => {
    const product1 = { legacyProductId: 100, value: 50 } as Product;
    const product2 = { legacyProductId: 101, value: 25.5 } as Product;

    const order1 = {
      legacyOrderId: 10,
      total: 75.5,
      date: '2021-01-01',
      products: [product1, product2],
    } as any as Order;

    const user: User = {
      legacyUserId: 1,
      name: 'Bob',
      orders: [order1],
    } as any;

    const expectedProductDtos: ProductResponseDto[] = [
      { product_id: 100, value: '50.00' },
      { product_id: 101, value: '25.50' },
    ];

    const expectedOrderDto: OrderResponseDto = {
      order_id: 10,
      total: '75.50',
      date: '2021-01-01',
      products: expectedProductDtos,
    };

    const expectedUserDto: UserOrderResponseDto = {
      user_id: 1,
      name: 'Bob',
      orders: [expectedOrderDto],
    };

    const result = mapper.toResponseDto([user]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedUserDto);
  });

  it('should handle users with undefined orders property', () => {
    const user: User = { legacyUserId: 2, name: 'Charlie' } as any;
    const result = mapper.toResponseDto([user]);
    expect(result[0].orders).toEqual([]);
  });

  it('should map order with undefined products to DTO with empty products array', () => {
    const order = {
      legacyOrderId: 99,
      total: 10,
      date: '2021-02-02',
      products: undefined,
    } as any as Order;

    const user: User = {
      legacyUserId: 7,
      name: 'NoProducts',
      orders: [order],
    } as any;

    const result = mapper.toResponseDto([user]);
    expect(result[0].orders[0].products).toEqual([]);
  });
});
