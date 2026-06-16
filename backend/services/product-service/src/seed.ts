import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { slugify } from './utils/slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'sneakers' },
      update: {},
      create: { name: 'Sneakers', slug: 'sneakers', description: 'Giày thể thao năng động', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'running' },
      update: {},
      create: { name: 'Running', slug: 'running', description: 'Giày chạy bộ chuyên dụng', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'casual' },
      update: {},
      create: { name: 'Casual', slug: 'casual', description: 'Giày thường ngày thoải mái', sortOrder: 3 },
    }),
  ]);

  const products = [
    {
      name: 'Nike Air Max 270',
      brand: 'Nike',
      categoryId: categories[0].id,
      tags: ['bestseller', 'new'],
      variants: [
        { sku: 'NAM270-BLK-40', price: 3500000, color: 'Black', size: '40', stock: 10 },
        { sku: 'NAM270-BLK-41', price: 3500000, color: 'Black', size: '41', stock: 8 },
        { sku: 'NAM270-BLK-42', price: 3500000, color: 'Black', size: '42', stock: 5 },
        { sku: 'NAM270-WHT-41', price: 3500000, color: 'White', size: '41', stock: 12 },
        { sku: 'NAM270-WHT-42', price: 3500000, color: 'White', size: '42', stock: 7 },
      ],
    },
    {
      name: 'Adidas Ultraboost 22',
      brand: 'Adidas',
      categoryId: categories[1].id,
      tags: ['running', 'popular'],
      variants: [
        { sku: 'AUB22-BLK-40', price: 4200000, compareAtPrice: 4800000, color: 'Black', size: '40', stock: 6 },
        { sku: 'AUB22-BLK-41', price: 4200000, compareAtPrice: 4800000, color: 'Black', size: '41', stock: 9 },
        { sku: 'AUB22-GRY-42', price: 4200000, compareAtPrice: 4800000, color: 'Grey', size: '42', stock: 4 },
      ],
    },
    {
      name: 'Converse Chuck Taylor All Star',
      brand: 'Converse',
      categoryId: categories[2].id,
      tags: ['classic', 'casual'],
      variants: [
        { sku: 'CTAS-WHT-38', price: 1800000, color: 'White', size: '38', stock: 15 },
        { sku: 'CTAS-WHT-39', price: 1800000, color: 'White', size: '39', stock: 10 },
        { sku: 'CTAS-BLK-39', price: 1800000, color: 'Black', size: '39', stock: 8 },
        { sku: 'CTAS-BLK-40', price: 1800000, color: 'Black', size: '40', stock: 12 },
      ],
    },
    {
      name: 'New Balance 574',
      brand: 'New Balance',
      categoryId: categories[0].id,
      tags: ['retro'],
      variants: [
        { sku: 'NB574-GRY-40', price: 2900000, color: 'Grey', size: '40', stock: 5 },
        { sku: 'NB574-GRY-41', price: 2900000, color: 'Grey', size: '41', stock: 7 },
        { sku: 'NB574-NVY-42', price: 2900000, color: 'Navy', size: '42', stock: 3 },
      ],
    },
    {
      name: 'Vans Old Skool',
      brand: 'Vans',
      categoryId: categories[2].id,
      tags: ['classic'],
      variants: [
        { sku: 'VOS-BLK-39', price: 1600000, color: 'Black', size: '39', stock: 20 },
        { sku: 'VOS-BLK-40', price: 1600000, color: 'Black', size: '40', stock: 15 },
        { sku: 'VOS-WHT-40', price: 1600000, color: 'White', size: '40', stock: 10 },
      ],
    },
  ];

  for (const p of products) {
    const slug = slugify(p.name);
    const { variants, ...productData } = p;
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        ...productData,
        slug,
        description: `${p.name} - Chất lượng cao, thoải mái cho mọi hoạt động`,
        images: {
          create: [
            { url: `https://via.placeholder.com/800x800?text=${encodeURIComponent(p.name)}`, altText: p.name, position: 0 },
          ],
        },
        variants: { create: variants },
      },
    });
    console.log(`✓ ${p.name}`);
  }

  console.log('Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
