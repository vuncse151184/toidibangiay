import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductDto, SortOption } from './dto/search-product.dto';
import { slugify } from '../../utils/slugify';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchProductDto) {
    const { q, category, brand, color, size, minPrice, maxPrice, sort, page = 1, limit = 20 } = dto;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (brand) where.brand = { equals: brand, mode: 'insensitive' };
    if (category) where.category = { slug: category };

    if (color || size || minPrice !== undefined || maxPrice !== undefined) {
      const variantWhere: Prisma.ProductVariantWhereInput = { isActive: true };
      if (color) variantWhere.color = { equals: color, mode: 'insensitive' };
      if (size) variantWhere.size = size;
      if (minPrice !== undefined || maxPrice !== undefined) {
        variantWhere.price = {};
        if (minPrice !== undefined) variantWhere.price.gte = minPrice;
        if (maxPrice !== undefined) variantWhere.price.lte = maxPrice;
      }
      where.variants = { some: variantWhere };
    }

    const orderBy = this.buildOrderBy(sort);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { images: { orderBy: { position: 'asc' } }, variants: { where: { isActive: true } }, category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: { images: { orderBy: { position: 'asc' } }, variants: { where: { isActive: true }, orderBy: { price: 'asc' } }, category: true },
    });
    if (!product) throw new NotFoundException(`Product "${slug}" not found`);
    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true, category: true },
    });
    if (!product) throw new NotFoundException(`Product "${id}" not found`);
    return product;
  }

  async create(dto: CreateProductDto) {
    const { variants, ...productData } = dto;

    let slug = dto.slug ?? slugify(dto.name);
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    return this.prisma.product.create({
      data: {
        ...productData,
        slug,
        variants: variants?.length ? { create: variants } : undefined,
      },
      include: { variants: true, images: true, category: true },
    });
  }

  async addImage(productSlug: string, url: string, altText?: string, position = 0) {
    const product = await this.prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) throw new NotFoundException(`Product "${productSlug}" not found`);
    return this.prisma.productImage.create({
      data: { productId: product.id, url, altText, position },
    });
  }

  private buildOrderBy(sort?: SortOption): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case SortOption.PRICE_ASC:
        return { variants: { _min: { price: 'asc' } } };
      case SortOption.PRICE_DESC:
        return { variants: { _min: { price: 'desc' } } };
      default:
        return { createdAt: 'desc' };
    }
  }
}
