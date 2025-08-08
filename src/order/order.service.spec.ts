import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderService } from './order.service';
import { User } from './entities/user.entity';
import { Order } from './entities/order.entity';
import { Product } from './entities/product.entity';
import { FileParserService } from '../file-parser/file-parser.service';
import { OrderMapper } from './order.mapper';
import { GetOrdersQueryDto } from './dto';
import { OrderLineData, GroupedUserData } from '../common/interfaces';

describe('OrderService', () => {
  let service: OrderService;
  let userRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let orderRepo: Partial<Record<keyof Repository<Order>, jest.Mock>>;
  let productRepo: Partial<Record<keyof Repository<Product>, jest.Mock>>;
  let parser: Partial<FileParserService>;
  let mapper: Partial<OrderMapper>;

  beforeEach(async () => {
    userRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      }),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    orderRepo = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    productRepo = {
      create: jest.fn(),
    };
    parser = {
      parseFileContent: jest.fn(),
    };
    mapper = {
      toResponseDto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: FileParserService, useValue: parser },
        { provide: OrderMapper, useValue: mapper },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('getOrders', () => {
    it('should query users with filters and map to DTO', async () => {
      const qb: any = userRepo.createQueryBuilder!();
      const users = [{ id: 1 } as User];
      qb.getMany.mockResolvedValue(users);
      const dto = [{ user_id: 1, name: '', orders: [] }];
      (mapper.toResponseDto as jest.Mock).mockReturnValue(dto);

      const queryDto = new GetOrdersQueryDto();
      queryDto.orderId = 123;
      queryDto.startDate = '2021-01-01';
      queryDto.endDate = '2021-01-31';

      const result = await service.getOrders(queryDto);

      expect(userRepo.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(qb.andWhere).toHaveBeenCalledTimes(2);
      expect(qb.getMany).toHaveBeenCalled();
      expect(mapper.toResponseDto).toHaveBeenCalledWith(users);
      expect(result).toEqual(dto);
    });

    it('should handle query errors', async () => {
      jest.spyOn(userRepo, 'createQueryBuilder').mockImplementation(() => {
        throw new Error('Query Error');
      });
      await expect(service.getOrders({})).rejects.toThrow();
    });
  });

  describe('processFile', () => {
    it('should parse file content and call saveOrderData', async () => {
      const file = { buffer: Buffer.from('data') } as Express.Multer.File;
      (parser.parseFileContent as jest.Mock).mockReturnValue([
        {
          userId: 1,
          userName: 'U',
          orderId: 10,
          productId: 100,
          productValue: 5,
          purchaseDate: '2021-01-01',
        } as OrderLineData,
      ]);
      const saveSpy = jest
        .spyOn(service as any, 'saveOrderData')
        .mockResolvedValue(undefined);

      await service.processFile(file);

      expect(parser.parseFileContent).toHaveBeenCalledWith('data');
      expect(saveSpy).toHaveBeenCalledWith([
        {
          userId: 1,
          userName: 'U',
          orderId: 10,
          productId: 100,
          productValue: 5,
          purchaseDate: '2021-01-01',
        },
      ]);
    });

    it('should handle invalid file processing', async () => {
      const invalidFile: Express.Multer.File = {
        buffer: Buffer.from('invalid content'),
        fieldname: 'file',
        originalname: 'invalid.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 15,
        destination: '',
        filename: '',
        path: '',
        stream: undefined as any,
      };
      await expect(service.processFile(invalidFile)).rejects.toThrow();
    });

    it('should handle database transaction errors', async () => {
      const validFile: Express.Multer.File = {
        buffer: Buffer.from('valid content'),
        fieldname: 'file',
        originalname: 'valid.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 15,
        destination: '',
        filename: '',
        path: '',
        stream: undefined as any,
      };
      (orderRepo as any).manager = {
        transaction: jest.fn().mockRejectedValue(new Error('DB Error')),
      };
      await expect(service.processFile(validFile)).rejects.toThrow();
    });
  });

  describe('saveUserWithOrders', () => {
    it('should create user and orders when none exist', async () => {
      const userData: GroupedUserData = {
        userId: 1,
        userName: 'U',
        orders: new Map([
          [
            10,
            {
              orderId: 10,
              date: '2021-01-01',
              products: [{ productId: 100, value: 20 }],
              total: 20,
            },
          ],
        ]),
      };

      (userRepo.findOneBy as jest.Mock).mockResolvedValue(undefined);
      (userRepo.create as jest.Mock).mockReturnValue({
        legacyUserId: 1,
        name: 'U',
      });
      (userRepo.save as jest.Mock).mockResolvedValue({
        id: 5,
        legacyUserId: 1,
        name: 'U',
      });
      (orderRepo.find as jest.Mock).mockResolvedValue([]);
      (orderRepo.create as jest.Mock).mockImplementation((dto) => dto as Order);
      (orderRepo.save as jest.Mock).mockResolvedValue([]);
      (productRepo.create as jest.Mock).mockImplementation(
        (dto) => dto as Product,
      );

      await (service as any).saveUserWithOrders(userData);

      expect(userRepo.create).toHaveBeenCalledWith({
        legacyUserId: 1,
        name: 'U',
      });
      expect(userRepo.save).toHaveBeenCalled();
      expect(orderRepo.create).toHaveBeenCalledTimes(1);
      expect(orderRepo.save).toHaveBeenCalled();
    });
  });

  describe('groupOrderData', () => {
    it('should group flat order lines correctly', () => {
      const lines: OrderLineData[] = [
        {
          userId: 1,
          userName: 'U',
          orderId: 10,
          productId: 100,
          productValue: 1,
          purchaseDate: '2021-01-01',
        },
        {
          userId: 1,
          userName: 'U',
          orderId: 10,
          productId: 101,
          productValue: 2,
          purchaseDate: '2021-01-01',
        },
      ];
      const grouped = (service as any).groupOrderData(lines);
      expect(grouped).toHaveLength(1);
      const entry = grouped[0];
      expect(entry.orders.get(10).products).toHaveLength(2);
      expect(entry.orders.get(10).total).toBe(3);
    });
  });

  describe('groupOrderData', () => {
    it('should group flat order lines correctly', () => {
      const lines: OrderLineData[] = [
        {
          userId: 1,
          userName: 'U',
          orderId: 10,
          productId: 100,
          productValue: 1,
          purchaseDate: '2021-01-01',
        },
        {
          userId: 1,
          userName: 'U',
          orderId: 10,
          productId: 101,
          productValue: 2,
          purchaseDate: '2021-01-01',
        },
      ];
      const grouped = (service as any).groupOrderData(lines);
      expect(grouped).toHaveLength(1);
      const entry = grouped[0];
      expect(entry.orders.get(10).products).toHaveLength(2);
      expect(entry.orders.get(10).total).toBe(3);
    });
  });

  describe('saveOrderData', () => {
    it('should group data and call saveUserWithOrders for each group', async () => {
      const lines: OrderLineData[] = [
        {
          userId: 1,
          userName: 'User A',
          orderId: 10,
          productId: 100,
          productValue: 5,
          purchaseDate: '',
        },
        {
          userId: 2,
          userName: 'User B',
          orderId: 20,
          productId: 200,
          productValue: 15,
          purchaseDate: '',
        },
      ];
      const grouped: GroupedUserData[] = [
        {
          userId: 1,
          userName: 'User A',
          orders: new Map([
            [
              10,
              {
                orderId: 10,
                date: '',
                products: [{ productId: 100, value: 5 }],
                total: 5,
              },
            ],
          ]),
        },
        {
          userId: 2,
          userName: 'User B',
          orders: new Map([
            [
              20,
              {
                orderId: 20,
                date: '',
                products: [{ productId: 200, value: 15 }],
                total: 15,
              },
            ],
          ]),
        },
      ];
      const groupSpy = jest
        .spyOn(service as any, 'groupOrderData')
        .mockReturnValue(grouped);
      const saveUserSpy = jest
        .spyOn(service as any, 'saveUserWithOrders')
        .mockResolvedValue(undefined);

      await (service as any).saveOrderData(lines);

      expect(groupSpy).toHaveBeenCalledWith(lines);
      expect(saveUserSpy).toHaveBeenCalledTimes(grouped.length);
      expect(saveUserSpy).toHaveBeenCalledWith(grouped[0]);
      expect(saveUserSpy).toHaveBeenCalledWith(grouped[1]);
    });

    it('should not call saveUserWithOrders when no groups', async () => {
      const lines: OrderLineData[] = [];
      const groupSpy = jest
        .spyOn(service as any, 'groupOrderData')
        .mockReturnValue([]);
      const saveUserSpy = jest
        .spyOn(service as any, 'saveUserWithOrders')
        .mockResolvedValue(undefined);

      await (service as any).saveOrderData(lines);

      expect(groupSpy).toHaveBeenCalledWith(lines);
      expect(saveUserSpy).not.toHaveBeenCalled();
    });
  });

  it('should log when new orders are saved', async () => {
    const userData: GroupedUserData = {
      userId: 10,
      userName: 'Test User',
      orders: new Map([
        [
          99,
          {
            orderId: 99,
            date: '2023-01-01',
            products: [{ productId: 8, value: 15 }],
            total: 15,
          },
        ],
      ]),
    };

    (userRepo.findOneBy as jest.Mock).mockResolvedValue({
      id: 1,
      legacyUserId: 10,
      name: 'Test User',
    });
    (orderRepo.find as jest.Mock).mockResolvedValue([]);
    (orderRepo.create as jest.Mock).mockImplementation((o) => o as Order);
    (orderRepo.save as jest.Mock).mockResolvedValue([]);
    (productRepo.create as jest.Mock).mockImplementation(
      (dto) => dto as Product,
    );

    const loggerSpy = jest.spyOn(service['logger'], 'log');

    await (service as any).saveUserWithOrders(userData);

    expect(orderRepo.save).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      'Salvos 1 pedidos para o usuário 10 (Test User)',
    );
  });

  it('should not add date filter if startDate or endDate is missing', async () => {
    const qb: any = userRepo.createQueryBuilder!();
    qb.getMany.mockResolvedValue([{ id: 1 } as User]);
    (mapper.toResponseDto as jest.Mock).mockReturnValue([
      { user_id: 1, name: '', orders: [] },
    ]);

    let queryDto = new GetOrdersQueryDto();
    queryDto.startDate = '2021-01-01';

    await service.getOrders(queryDto);
    expect(qb.andWhere).not.toHaveBeenCalledWith(
      'order.date BETWEEN :startDate AND :endDate',
      expect.any(Object),
    );

    queryDto = new GetOrdersQueryDto();
    queryDto.endDate = '2021-01-31';

    await service.getOrders(queryDto);
    expect(qb.andWhere).not.toHaveBeenCalledWith(
      'order.date BETWEEN :startDate AND :endDate',
      expect.any(Object),
    );
  });

  it('should skip creating orders if legacyOrderId already exists', async () => {
    const userData: GroupedUserData = {
      userId: 1,
      userName: 'Existente',
      orders: new Map([
        [
          42,
          {
            orderId: 42,
            date: '2021-01-01',
            products: [{ productId: 99, value: 12.34 }],
            total: 12.34,
          },
        ],
      ]),
    };

    (userRepo.findOneBy as jest.Mock).mockResolvedValue({
      id: 1,
      legacyUserId: 1,
      name: 'Existente',
    });

    (orderRepo.find as jest.Mock).mockResolvedValue([
      { legacyOrderId: 42, user: { id: 1 } },
    ]);
    (orderRepo.create as jest.Mock).mockImplementation((dto) => dto as Order);
    (orderRepo.save as jest.Mock).mockResolvedValue([]);
    (productRepo.create as jest.Mock).mockImplementation(
      (dto) => dto as Product,
    );

    await (service as any).saveUserWithOrders(userData);

    expect(orderRepo.save).toHaveBeenCalledWith([]);
  });
});
