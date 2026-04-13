export interface Product {
  id: string;
  shopId: string;
  name: string;
  sku: string;
  barcode?: string | null;
  valuationMethod: string;
  categoryId?: string | null;
  uomId?: string | null;
  gstPercentage: number;
  hsnCode?: string | null;
  sellingPrice: number;
  purchasePrice: number;
  lowStockThreshold: number;
  imageUrl?: string | null;
  currentStock?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  shopId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface Uom {
  id: string;
  shopId: string;
  name: string;
  symbol: string;
  isActive: boolean;
}
