import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { User, Order, Product } from './entities';
import { FileParserModule } from '../file-parser/file-parser.module';
import { OrderMapper } from './order.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Product]), FileParserModule],
  controllers: [OrderController],
  providers: [OrderService, OrderMapper],
  exports: [],
})
export class OrderModule {}
