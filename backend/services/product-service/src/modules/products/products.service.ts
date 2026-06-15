import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Prisma } from "../../../generated/prisma";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { SearchProductDto, SortOption } from "./dto/search-product.dto";
import { slugify } from "../../utils/slugify";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqp: AmqpConnection,
  ) {}

  private async publishEvent(routingKey: string, payload: any) {
    try {
      await this.amqp.publish("products", routingKey, payload);
    } catch (err) {
      // non-fatal: search sync can lag behind
    }
  }

  async search(dto: SearchProductDto) {
    const { q, category, brand, color, size, minPrice, maxPrice, sort, page = 1, limit = 20 } = dto;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
      ];
    }

    if (brand) where.brand = { equals: brand, mode: "insensitive" };
    if (category) where.category = { slug: category };

    if (color || size || minPrice !== undefined || maxPrice !== undefined) {
      const variantWhere: Prisma.ProductVariantWhereInput = { isActive: true };
      if (color) variantWhere.color = { equals: color, mode: "insensitive" };
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
        include: { images: { orderBy: { position: "asc" } }, variants: { where: { isActive: true } }, category: true },
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
      include: { images: { orderBy: { position: "asc" } }, variants: { where: { isActive: true }, orderBy: { price: "asc" } }, category: true },
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
    const { variants, images, ...productData } = dto;

    let slug = dto.slug ?? slugify(dto.name);
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          ...productData,
          slug,
          images: images?.length ? { create: images } : undefined,
          variants: variants?.length ? { create: variants } : undefined,
        },
        include: { variants: true, images: true, category: true },
      });
      await this.publishEvent("product.created", product);
      return product;
    } catch (err: any) {
      if (err?.code === "P2002") {
        const field = err.meta?.target?.[0] ?? "field";
        throw new ConflictException(`Duplicate value for ${field}`);
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const { variants, images, ...productData } = dto;

    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Product "${id}" not found`);

    let slug = existing.slug;
    if (productData.name && productData.name !== existing.name) {
      const candidate = slugify(productData.name);
      const conflict = await this.prisma.product.findFirst({ where: { slug: candidate, id: { not: id } } });
      if (!conflict) slug = candidate;
    }

    try {
      const product = await this.prisma.$transaction(async (tx) => {
        await tx.product.update({ where: { id }, data: { ...productData, slug } });

        if (images !== undefined) {
          await tx.productImage.deleteMany({ where: { productId: id } });
          if (images.length) {
            await tx.productImage.createMany({
              data: images.map((img) => ({ productId: id, url: img.url, altText: img.altText, position: img.position ?? 0 })),
            });
          }
        }

        if (variants !== undefined) {
          const toUpdate = variants.filter((v) => v.id);
          const toCreate = variants.filter((v) => !v.id);
          const keepIds = toUpdate.map((v) => v.id!);

          await tx.productVariant.deleteMany({ where: { productId: id, id: { notIn: keepIds } } });

          await Promise.all(
            toUpdate.map((v) =>
              tx.productVariant.update({
                where: { id: v.id! },
                data: { sku: v.sku, size: v.size, color: v.color, price: v.price, compareAtPrice: v.compareAtPrice, stock: v.stock, isActive: v.isActive, image: v.image },
              }),
            ),
          );

          if (toCreate.length) {
            await tx.productVariant.createMany({
              data: toCreate.map((v) => ({
                productId: id,
                sku: v.sku,
                size: v.size,
                color: v.color,
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                stock: v.stock,
                isActive: v.isActive ?? true,
                image: v.image,
              })),
            });
          }
        }

        return tx.product.findUnique({ where: { id }, include: { variants: true, images: true, category: true } });
      });
      await this.publishEvent("product.updated", product);
      return product;
    } catch (err: any) {
      if (err?.code === "P2002") {
        const field = err.meta?.target?.[0] ?? "field";
        throw new ConflictException(`Duplicate value for ${field}`);
      }
      throw err;
    }
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
        return { variants: { _min: { price: "asc" } } } as any;
      case SortOption.PRICE_DESC:
        return { variants: { _min: { price: "desc" } } } as any;
      default:
        return { createdAt: "desc" };
    }
  }
}