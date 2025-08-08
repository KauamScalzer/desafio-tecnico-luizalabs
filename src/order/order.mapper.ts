import { Injectable } from '@nestjs/common';
import { User, Order, Product } from './entities';
import {
  UserOrderResponseDto,
  OrderResponseDto,
  ProductResponseDto,
} from './dto';

@Injectable()
export class OrderMapper {
  toResponseDto(users: User[]): UserOrderResponseDto[] {
    return users.map((user) => ({
      user_id: user.legacyUserId,
      name: user.name,
      orders: user.orders?.map((order) => this.toOrderResponseDto(order)) || [],
    }));
  }

  private toOrderResponseDto(order: Order): OrderResponseDto {
    return {
      order_id: order.legacyOrderId,
      total: order.total.toFixed(2),
      date: order.date,
      products:
        order.products?.map((product) => this.toProductResponseDto(product)) ||
        [],
    };
  }

  private toProductResponseDto(product: Product): ProductResponseDto {
    return {
      product_id: product.legacyProductId,
      value: product.value.toFixed(2),
    };
  }
}
