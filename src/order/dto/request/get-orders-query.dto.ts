import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsDateString } from 'class-validator';

export class GetOrdersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'orderId deve ser um inteiro' })
  @Min(1, { message: 'orderId deve ser ≥ 1' })
  orderId?: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'startDate deve estar no formato ISO (YYYY-MM-DD)' },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'endDate deve estar no formato ISO (YYYY-MM-DD)' },
  )
  endDate?: string;
}
