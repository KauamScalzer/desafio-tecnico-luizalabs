import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { UserOrderResponseDto, GetOrdersQueryDto } from './dto';
import { FileParserService } from '../file-parser/file-parser.service';
import { OrderMapper } from './order.mapper';
import { Order, User, Product } from './entities';
import { OrderLineData, GroupedUserData } from '../common/interfaces';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private fileParserService: FileParserService,
    private orderMapper: OrderMapper,
  ) {}

  async getOrders(
    queryDto: GetOrdersQueryDto,
  ): Promise<UserOrderResponseDto[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.orders', 'order')
      .leftJoinAndSelect('order.products', 'product');

    if (queryDto.orderId) {
      queryBuilder.andWhere('order.legacyOrderId = :orderId', {
        orderId: queryDto.orderId,
      });
    }

    if (queryDto.startDate && queryDto.endDate) {
      queryBuilder.andWhere('order.date BETWEEN :startDate AND :endDate', {
        startDate: queryDto.startDate,
        endDate: queryDto.endDate,
      });
    }

    const users = await queryBuilder.getMany();
    this.logger.log(`Consultados ${users.length} usuários com pedidos`);
    return this.orderMapper.toResponseDto(users);
  }

  async processFile(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado!');
    }
    this.logger.log('Iniciando processamento de arquivo');
    const fileContent = file.buffer.toString('utf-8');
    const orderLines = this.fileParserService.parseFileContent(fileContent);
    this.logger.log(`Arquivo processado com ${orderLines.length} linhas`);
    await this.saveOrderData(orderLines);
  }

  private async saveOrderData(orderLines: OrderLineData[]): Promise<void> {
    const groupedData = this.groupOrderData(orderLines);
    this.logger.log(`Agrupados dados de ${groupedData.length} usuários`);

    for (const userData of groupedData) {
      await this.saveUserWithOrders(userData);
    }
  }

  private async saveUserWithOrders(userData: GroupedUserData): Promise<void> {
    const { userId, userName, orders } = userData;

    let user = await this.userRepository.findOneBy({ legacyUserId: userId });

    if (!user) {
      user = await this.userRepository.save(
        this.userRepository.create({ legacyUserId: userId, name: userName }),
      );
      this.logger.log(`Usuário criado: ${userName} (${userId})`);
    }

    const existingOrders = await this.orderRepository.find({
      where: {
        legacyOrderId: In(Array.from(orders.keys())),
        user: { id: user.id },
      },
      relations: ['user'],
    });

    const existingLegacyOrderIds = new Set(
      existingOrders.map((o) => o.legacyOrderId),
    );
    const newOrders: Order[] = [];

    for (const [legacyOrderId, orderData] of orders) {
      if (existingLegacyOrderIds.has(legacyOrderId)) continue;

      const order = this.orderRepository.create({
        legacyOrderId,
        date: orderData.date,
        total: orderData.total,
        user,
        products: orderData.products.map((p) =>
          this.productRepository.create({
            legacyProductId: p.productId,
            value: p.value,
          }),
        ),
      });
      newOrders.push(order);
    }
    await this.orderRepository.save(newOrders);
    this.logger.log(
      `Salvos ${newOrders.length} pedidos para o usuário ${user.legacyUserId} (${user.name})`,
    );
  }

  private groupOrderData(orderLines: OrderLineData[]): GroupedUserData[] {
    const userMap = new Map<number, GroupedUserData>();

    for (const {
      userId,
      userName,
      orderId,
      productId,
      productValue,
      purchaseDate,
    } of orderLines) {
      let user = userMap.get(userId);
      if (!user) {
        user = {
          userId,
          userName: userName,
          orders: new Map(),
        };
        userMap.set(userId, user);
      }

      let order = user.orders.get(orderId);
      if (!order) {
        order = {
          orderId,
          date: purchaseDate,
          products: [],
          total: 0,
        };
        user.orders.set(orderId, order);
      }

      order.products.push({ productId, value: productValue });
      order.total += productValue;
    }

    return Array.from(userMap.values());
  }
}
