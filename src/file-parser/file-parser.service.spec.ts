import { FileParserService } from './file-parser.service';

describe('FileParserService', () => {
  let service: FileParserService;

  beforeEach(() => {
    service = new FileParserService();
  });

  it('should parse a single correctly formatted line', () => {
    const userIdStr = '0000000001';
    const userName = 'Alice';
    const paddedName = userName + ' '.repeat(45 - userName.length);
    const orderIdStr = '0000001002';
    const productIdStr = '0000002003';
    const valueStr = '000000123.45';
    const dateStr = '20210101';
    const line =
      userIdStr + paddedName + orderIdStr + productIdStr + valueStr + dateStr;
    expect(line.length).toBe(95);

    const result = service.parseFileContent(line);

    expect(result).toEqual([
      {
        userId: 1,
        userName: 'Alice',
        orderId: 1002,
        productId: 2003,
        productValue: 123.45,
        purchaseDate: '2021-01-01',
      },
    ]);
  });

  it('should parse multiple lines correctly', () => {
    const makeLine = (
      id: number,
      name: string,
      order: number,
      product: number,
      value: number,
      date: string,
    ) => {
      const uid = id.toString().padStart(10, '0');
      const uname = name + ' '.repeat(45 - name.length);
      const oid = order.toString().padStart(10, '0');
      const pid = product.toString().padStart(10, '0');
      const val = value.toFixed(2).padStart(12, '0');
      const d = date.replace(/-/g, '');
      return uid + uname + oid + pid + val + d;
    };
    const line1 = makeLine(2, 'Bob', 20, 300, 45.6, '2021-02-02');
    const line2 = makeLine(3, 'Carol', 30, 400, 78, '2021-03-03');
    const content = `${line1}\n${line2}`;

    const result = service.parseFileContent(content);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({
      userId: 3,
      userName: 'Carol',
      orderId: 30,
      productId: 400,
      productValue: 78.0,
      purchaseDate: '2021-03-03',
    });
  });

  it('should trim whitespace and ignore empty lines', () => {
    const line =
      '0000000004' +
      'Dave'.padEnd(45, ' ') +
      '0000004005'.padStart(10, '0') +
      '0000005006'.padStart(10, '0') +
      '000000010.00'.padStart(12, '0') +
      '20210404';
    const content = `  \n${line}\n  `;
    const spy = jest.spyOn((service as any).logger, 'log');

    const result = service.parseFileContent(content);
    expect(result).toEqual([
      {
        userId: 4,
        userName: 'Dave',
        orderId: 4005,
        productId: 5006,
        productValue: 10.0,
        purchaseDate: '2021-04-04',
      },
    ]);
    expect(spy).toHaveBeenCalledWith('Total de linhas válidas parseadas: 1');
  });
});
