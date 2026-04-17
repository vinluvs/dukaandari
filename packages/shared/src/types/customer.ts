export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string | null;
  email: string | null;
  creditLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  balance?: number;
}
