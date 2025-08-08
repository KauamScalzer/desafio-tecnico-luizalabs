import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from './order-response.dto';

export class UserOrderResponseDto {
  @ApiProperty({ example: 55, description: 'ID do usuário' })
  user_id: number;

  @ApiProperty({ example: 'Kris Lockman', description: 'Nome do usuário' })
  name: string;

  @ApiProperty({
    type: [OrderResponseDto],
    description: 'Lista de pedidos do usuário',
  })
  orders: OrderResponseDto[];
}
