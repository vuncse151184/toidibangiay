import { Injectable } from '@nestjs/common';
import { env } from '../config/env';

interface ProductVariantDetail {
  id: string;
  sku: string;
  price: number;
  color: string | null;
  size: string | null;
  stock: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: { url: string; position: number }[];
  };
}

@Injectable()
export class ProductClientService {
  async getVariantById(variantId: string): Promise<ProductVariantDetail | null> {
    try {
      const res = await fetch(`${env.PRODUCT_SERVICE_URL}/variants/${variantId}`);
      if (!res.ok) return null;
      return res.json() as Promise<ProductVariantDetail>;
    } catch {
      return null;
    }
  }
}
