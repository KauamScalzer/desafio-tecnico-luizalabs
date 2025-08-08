export interface GroupedUserData {
  userId: number;
  userName: string;
  orders: Map<number, GroupedOrderData>;
}

export interface GroupedOrderData {
  orderId: number;
  date: string;
  products: GroupedProductData[];
  total: number;
}

export interface GroupedProductData {
  productId: number;
  value: number;
}
