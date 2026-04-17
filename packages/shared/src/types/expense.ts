export interface Expense {
  id: string;
  shopId: string;
  category: string;
  amount: number;
  description: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
