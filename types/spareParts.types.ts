// types/spareParts.types.ts
export interface SparePart {
  id: string;
  busModel: string;
  article: string;
  name: string;
  unitPrice: number;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
}

export interface LaborTime {
  id: string;
  busModel: string;
  operationCode: string;
  operationName: string;
  quantity: number;
  hours: number;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
  price?: number;
}
