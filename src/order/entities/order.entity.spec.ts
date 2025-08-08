import { Order } from './order.entity';
import { User } from './user.entity';
import { Product } from './product.entity';

describe('Order Entity', () => {
  it('should instantiate with properties', () => {
    const order = new Order();
    order.id = 1;
    order.legacyOrderId = 1001;
    order.date = '2024-01-01';
    order.total = 123.45;
    order.userId = 2;
    order.user = new User();
    order.products = [new Product()];

    expect(order.id).toBe(1);
    expect(order.legacyOrderId).toBe(1001);
    expect(order.date).toBe('2024-01-01');
    expect(order.total).toBe(123.45);
    expect(order.userId).toBe(2);
    expect(order.user).toBeInstanceOf(User);
    expect(order.products[0]).toBeInstanceOf(Product);
  });
});
