import { Product } from './product.entity';
import { Order } from './order.entity';

describe('Product Entity', () => {
  it('should instantiate with properties', () => {
    const product = new Product();
    product.id = 10;
    product.legacyProductId = 2001;
    product.value = 10.55;
    product.orderId = 1;
    product.order = new Order();

    expect(product.id).toBe(10);
    expect(product.legacyProductId).toBe(2001);
    expect(product.value).toBe(10.55);
    expect(product.orderId).toBe(1);
    expect(product.order).toBeInstanceOf(Order);
  });
});
