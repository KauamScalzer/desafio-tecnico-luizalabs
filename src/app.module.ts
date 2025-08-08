import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { FileParserModule } from './file-parser/file-parser.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity.{ts,js}'],
      migrations: [__dirname + '/database/migrations/*.{ts,js}'],
      synchronize: process.env.NODE_ENV === 'test',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    OrderModule,
    FileParserModule,
  ],
})
export class AppModule {}
