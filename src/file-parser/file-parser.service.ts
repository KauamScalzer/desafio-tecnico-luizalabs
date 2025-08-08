import { Injectable, Logger } from '@nestjs/common';

import { OrderLineData } from '../common/interfaces';

@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  parseFileContent(content: string): OrderLineData[] {
    const lines = content.trim().split('\n');
    const parsed: OrderLineData[] = [];

    const USER_ID_RANGE = [0, 10];
    const USER_NAME_RANGE = [10, 55];
    const ORDER_ID_RANGE = [55, 65];
    const PRODUCT_ID_RANGE = [65, 75];
    const VALUE_RANGE = [75, 87];
    const DATE_RANGE = [87, 95];

    for (const line of lines) {
      const userId = parseInt(line.slice(...USER_ID_RANGE));
      const userName = line.slice(...USER_NAME_RANGE).trim();
      const orderId = parseInt(line.slice(...ORDER_ID_RANGE));
      const productId = parseInt(line.slice(...PRODUCT_ID_RANGE));
      const productValue = parseFloat(line.slice(...VALUE_RANGE));
      const rawDate = line.slice(...DATE_RANGE);
      const purchaseDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;

      parsed.push({
        userId,
        userName,
        orderId,
        productId,
        productValue,
        purchaseDate,
      });
    }

    this.logger.log(`Total de linhas válidas parseadas: ${parsed.length}`);
    return parsed;
  }
}
