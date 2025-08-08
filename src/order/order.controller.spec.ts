import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  GetOrdersQueryDto,
  UserOrderResponseDto,
  OrderResponseDto,
} from './dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: Partial<Record<keyof OrderService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      processFile: jest.fn(),
      getOrders: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: service }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  describe('upload', () => {
    it('should call OrderService.processFile and return its result', async () => {
      const fakeFile = {
        buffer: Buffer.from('testdata'),
      } as Express.Multer.File;
      service.processFile!.mockResolvedValue(undefined);

      const result = await controller.upload(fakeFile);

      expect(service.processFile).toHaveBeenCalledWith(fakeFile);
      expect(result).toBeUndefined();
    });

    it('should propagate exceptions from OrderService.processFile', async () => {
      const fakeFile = {
        buffer: Buffer.from('testdata'),
      } as Express.Multer.File;
      const error = new Error('upload failed');
      service.processFile!.mockRejectedValue(error);

      await expect(controller.upload(fakeFile)).rejects.toThrow(
        'upload failed',
      );
    });
  });

  describe('getOrders', () => {
    it('should call OrderService.getOrders with query and return DTOs', async () => {
      const query: GetOrdersQueryDto = {
        orderId: 5,
        startDate: '2021-01-01',
        endDate: '2021-01-02',
      };
      const dto: UserOrderResponseDto[] = [
        { user_id: 1, name: 'U1', orders: [] as OrderResponseDto[] },
      ];
      service.getOrders!.mockResolvedValue(dto);

      const result = await controller.getOrders(query);

      expect(service.getOrders).toHaveBeenCalledWith(query);
      expect(result).toEqual(dto);
    });

    it('should propagate exceptions from OrderService.getOrders', async () => {
      const query: GetOrdersQueryDto = {} as any;
      const error = new Error('query failed');
      service.getOrders?.mockRejectedValue(error);

      await expect(controller.getOrders(query)).rejects.toThrow('query failed');
    });
  });
});
