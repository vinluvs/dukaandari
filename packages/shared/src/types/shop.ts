export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  gstNumber?: string | null;
  address?: string | null;
  financialYearStartMonth: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopMember {
  id: string;
  shopId: string;
  userId: string;
  role: "owner" | "manager" | "member";
  isActive: boolean;
}
