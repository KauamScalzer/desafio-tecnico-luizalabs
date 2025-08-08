import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

export class OrderResponseDto {
  @ApiProperty({ example: 123, description: 'ID do pedido' })
  order_id: number;

  @ApiProperty({
    example: '256.24',
    description: 'Valor total do pedido, formatado com duas casas decimais',
  })
  total: string;

  @ApiProperty({
    example: '2021-05-02',
    description: 'Data do pedido no formato YYYY-MM-DD',
  })
  date: string;

  @ApiProperty({
    type: [ProductResponseDto],
    description: 'Lista de produtos do pedido',
  })
  products: ProductResponseDto[];
}
