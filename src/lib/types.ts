export type OrderStatus =
  | "입금 확인 대기"
  | "입금 확인 완료"
  | "조리 중"
  | "서빙 완료"
  | "취소";

export type CartItem = {
  id: string;
  name: string;
  category: "main" | "side" | "set" | "coupon" | "charge";
  price: number;
  quantity: number;
  selectedSide?: string;
};

export type Order = {
  id: string;
  createdAt: string;
  tableNumber: string;
  headCount: number;
  depositorName: string;
  items: CartItem[];
  tableCharge: {
    price: 3000;
    quantity: number;
    total: number;
  };
  totalAmount: number;
  status: OrderStatus;
};

export type MenuItem = {
  id: string;
  category: "main" | "side" | "set" | "coupon";
  name: string;
  price: number;
  baseItems?: string;
  description?: string;
};

export type PendingOrder = Omit<Order, "id" | "createdAt" | "status">;
