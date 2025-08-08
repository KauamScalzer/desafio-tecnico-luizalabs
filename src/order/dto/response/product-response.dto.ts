import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: 'ID do produto' })
  product_id: number;

  @ApiProperty({ example: '100.00', description: 'Valor do produto' })
  value: string;
}
