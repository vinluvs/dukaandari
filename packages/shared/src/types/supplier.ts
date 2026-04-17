export interface Supplier {
  id: string;
  shopId: string;
  name: string;
  phone: string | null;
  email: string | null;
  gstNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  balance?: number;
}
