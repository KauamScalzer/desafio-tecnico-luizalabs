import {
  Controller,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import {
  UserOrderResponseDto,
  GetOrdersQueryDto,
  OrderResponseDto,
} from './dto';

@Controller('api/v1/order')
@ApiTags('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5_000_000 } }))
  @ApiOperation({ summary: 'Fazer upload do arquivo legado' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Sucesso ao processar o arquivo' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.orderService.processFile(file);
  }

  @Get()
  @ApiOperation({
    summary:
      'Listar pedidos, tendo possilibilidade de filtrar por orderId e data de ínicio e fim',
  })
  @ApiQuery({ name: 'orderId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos retornada com sucesso',
    type: [OrderResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getOrders(
    @Query() queryDto: GetOrdersQueryDto,
  ): Promise<UserOrderResponseDto[]> {
    return this.orderService.getOrders(queryDto);
  }
}
