import { DateTime } from "luxon";

export type FaturaType = {
    name: string;
    priceTotal: number;
    price: number;
    quantity: number;
    category: string;
    vendaId: number;
    createdAt: DateTime;
  };
  
  export type GenericReturnType = {
    name: string;
    total: number;
  };
  export type Products = {
    productId: number;
    quantity: number;
    vendaId?: number;
    price?: number;
  };
  export type updateProductType = {
    name?: string;
    price?: number;
    categoryId?: number;
    quantity?: number;
    expiresIn?: Date;
    stock?: number;
  };