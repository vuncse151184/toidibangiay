import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { slugify } from './utils/slugify';

const prisma = new PrismaClient();

const img = (name: string, bg = '111111') =>
  `https://placehold.co/800x800/${bg}/ffffff?text=${encodeURIComponent(name)}`;

async function main() {
  console.log('🌱 Seeding Nike products...');

  // ── Categories ──────────────────────────────────────────────────────────────
  const [catSneakers, catRunning, catCasual, catBasketball, catLifestyle] =
    await Promise.all([
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
      prisma.category.upsert({
        where: { slug: 'basketball' },
        update: {},
        create: { name: 'Basketball', slug: 'basketball', description: 'Giày bóng rổ chuyên nghiệp', sortOrder: 4 },
      }),
      prisma.category.upsert({
        where: { slug: 'lifestyle' },
        update: {},
        create: { name: 'Lifestyle', slug: 'lifestyle', description: 'Giày thời trang đường phố', sortOrder: 5 },
      }),
    ]);

  // ── Products ─────────────────────────────────────────────────────────────────
  const nikeProducts = [
    // ── 1. Air Force 1 '07 ────────────────────────────────────────────────────
    {
      name: "Nike Air Force 1 '07",
      brand: 'Nike',
      description:
        'Biểu tượng bóng rổ từ năm 1982 nay trở thành đôi giày thời trang đường phố được yêu thích nhất. Đế Air đệm êm ái, da nappa cao cấp.',
      categoryId: catLifestyle.id,
      tags: ['bestseller', 'classic', 'lifestyle'],
      images: [
        { url: img('AF1 White', 'f5f5f5'), altText: 'Nike Air Force 1 White', position: 0 },
        { url: img('AF1 Black', '111111'), altText: 'Nike Air Force 1 Black', position: 1 },
      ],
      variants: [
        { sku: 'NAF1-WHT-38', color: 'White', size: '38', price: 2700000, stock: 8 },
        { sku: 'NAF1-WHT-39', color: 'White', size: '39', price: 2700000, stock: 12 },
        { sku: 'NAF1-WHT-40', color: 'White', size: '40', price: 2700000, stock: 15 },
        { sku: 'NAF1-WHT-41', color: 'White', size: '41', price: 2700000, stock: 10 },
        { sku: 'NAF1-WHT-42', color: 'White', size: '42', price: 2700000, stock: 7 },
        { sku: 'NAF1-WHT-43', color: 'White', size: '43', price: 2700000, stock: 5 },
        { sku: 'NAF1-BLK-39', color: 'Black', size: '39', price: 2700000, stock: 9 },
        { sku: 'NAF1-BLK-40', color: 'Black', size: '40', price: 2700000, stock: 11 },
        { sku: 'NAF1-BLK-41', color: 'Black', size: '41', price: 2700000, stock: 8 },
        { sku: 'NAF1-BLK-42', color: 'Black', size: '42', price: 2700000, stock: 6 },
        { sku: 'NAF1-GRY-40', color: 'Wolf Grey', size: '40', price: 2700000, stock: 4 },
        { sku: 'NAF1-GRY-41', color: 'Wolf Grey', size: '41', price: 2700000, stock: 6 },
        { sku: 'NAF1-GRY-42', color: 'Wolf Grey', size: '42', price: 2700000, stock: 3 },
      ],
    },

    // ── 2. Dunk Low Retro ─────────────────────────────────────────────────────
    {
      name: 'Nike Dunk Low Retro',
      brand: 'Nike',
      description:
        'Thiết kế kinh điển từ sân bóng rổ đại học 1985. Mũi giày thấp, cổ thấp với phần đệm mỏng nhẹ giúp cảm nhận mặt đất tốt hơn.',
      categoryId: catSneakers.id,
      tags: ['popular', 'streetwear', 'hype'],
      images: [
        { url: img('Dunk Low Panda', 'f0f0f0'), altText: 'Nike Dunk Low Panda', position: 0 },
        { url: img('Dunk Low Black', '1a1a1a'), altText: 'Nike Dunk Low Black/White', position: 1 },
      ],
      variants: [
        { sku: 'NDL-PND-38', color: 'Panda', size: '38', price: 3200000, compareAtPrice: 3800000, stock: 5 },
        { sku: 'NDL-PND-39', color: 'Panda', size: '39', price: 3200000, compareAtPrice: 3800000, stock: 8 },
        { sku: 'NDL-PND-40', color: 'Panda', size: '40', price: 3200000, compareAtPrice: 3800000, stock: 6 },
        { sku: 'NDL-PND-41', color: 'Panda', size: '41', price: 3200000, compareAtPrice: 3800000, stock: 4 },
        { sku: 'NDL-PND-42', color: 'Panda', size: '42', price: 3200000, compareAtPrice: 3800000, stock: 3 },
        { sku: 'NDL-BLK-39', color: 'Black/White', size: '39', price: 3200000, stock: 7 },
        { sku: 'NDL-BLK-40', color: 'Black/White', size: '40', price: 3200000, stock: 9 },
        { sku: 'NDL-BLK-41', color: 'Black/White', size: '41', price: 3200000, stock: 5 },
        { sku: 'NDL-BLK-42', color: 'Black/White', size: '42', price: 3200000, stock: 4 },
        { sku: 'NDL-KTY-40', color: 'Kentucky', size: '40', price: 3500000, stock: 3 },
        { sku: 'NDL-KTY-41', color: 'Kentucky', size: '41', price: 3500000, stock: 2 },
      ],
    },

    // ── 3. Air Jordan 1 Retro High OG ─────────────────────────────────────────
    {
      name: 'Nike Air Jordan 1 Retro High OG',
      brand: 'Nike',
      description:
        'Đôi giày huyền thoại của Michael Jordan ra đời năm 1985. Cổ cao bảo vệ mắt cá chân, túi khí Nike Air, da cao cấp nhiều lớp.',
      categoryId: catBasketball.id,
      tags: ['jordan', 'hype', 'basketball', 'collectible'],
      images: [
        { url: img('Jordan 1 Chicago', 'cc0000'), altText: 'Air Jordan 1 Chicago', position: 0 },
        { url: img('Jordan 1 Royal Blue', '1a4fa0'), altText: 'Air Jordan 1 Royal Blue', position: 1 },
        { url: img('Jordan 1 Bred Toe', '1a1a1a'), altText: 'Air Jordan 1 Bred Toe', position: 2 },
      ],
      variants: [
        { sku: 'NAJ1-CHI-40', color: 'Chicago', size: '40', price: 6000000, compareAtPrice: 7500000, stock: 2 },
        { sku: 'NAJ1-CHI-41', color: 'Chicago', size: '41', price: 6000000, compareAtPrice: 7500000, stock: 3 },
        { sku: 'NAJ1-CHI-42', color: 'Chicago', size: '42', price: 6000000, compareAtPrice: 7500000, stock: 2 },
        { sku: 'NAJ1-CHI-43', color: 'Chicago', size: '43', price: 6000000, compareAtPrice: 7500000, stock: 1 },
        { sku: 'NAJ1-ROY-40', color: 'Royal Blue', size: '40', price: 5200000, compareAtPrice: 6500000, stock: 4 },
        { sku: 'NAJ1-ROY-41', color: 'Royal Blue', size: '41', price: 5200000, compareAtPrice: 6500000, stock: 5 },
        { sku: 'NAJ1-ROY-42', color: 'Royal Blue', size: '42', price: 5200000, compareAtPrice: 6500000, stock: 3 },
        { sku: 'NAJ1-ROY-43', color: 'Royal Blue', size: '43', price: 5200000, compareAtPrice: 6500000, stock: 2 },
        { sku: 'NAJ1-BRD-40', color: 'Bred Toe', size: '40', price: 5500000, stock: 3 },
        { sku: 'NAJ1-BRD-41', color: 'Bred Toe', size: '41', price: 5500000, stock: 4 },
        { sku: 'NAJ1-BRD-42', color: 'Bred Toe', size: '42', price: 5500000, stock: 2 },
        { sku: 'NAJ1-BRD-43', color: 'Bred Toe', size: '43', price: 5500000, stock: 1 },
      ],
    },

    // ── 4. Air Max 90 ─────────────────────────────────────────────────────────
    {
      name: 'Nike Air Max 90',
      brand: 'Nike',
      description:
        'Ra mắt năm 1990 với đơn vị Air lớn nhất lúc bấy giờ. Bộ ba lưới, da và da lộn kết hợp tạo nên phong cách retro không lẫn vào đâu được.',
      categoryId: catSneakers.id,
      tags: ['retro', 'classic', 'air-max'],
      images: [
        { url: img('Air Max 90 White', 'eeeeee'), altText: 'Nike Air Max 90 White/Black', position: 0 },
        { url: img('Air Max 90 Black', '222222'), altText: 'Nike Air Max 90 Black/Red', position: 1 },
      ],
      variants: [
        { sku: 'NAM90-WHT-39', color: 'White/Black', size: '39', price: 3100000, compareAtPrice: 3500000, stock: 7 },
        { sku: 'NAM90-WHT-40', color: 'White/Black', size: '40', price: 3100000, compareAtPrice: 3500000, stock: 10 },
        { sku: 'NAM90-WHT-41', color: 'White/Black', size: '41', price: 3100000, compareAtPrice: 3500000, stock: 8 },
        { sku: 'NAM90-WHT-42', color: 'White/Black', size: '42', price: 3100000, compareAtPrice: 3500000, stock: 5 },
        { sku: 'NAM90-WHT-43', color: 'White/Black', size: '43', price: 3100000, compareAtPrice: 3500000, stock: 4 },
        { sku: 'NAM90-BLK-39', color: 'Black/Red', size: '39', price: 3100000, stock: 6 },
        { sku: 'NAM90-BLK-40', color: 'Black/Red', size: '40', price: 3100000, stock: 9 },
        { sku: 'NAM90-BLK-41', color: 'Black/Red', size: '41', price: 3100000, stock: 7 },
        { sku: 'NAM90-BLK-42', color: 'Black/Red', size: '42', price: 3100000, stock: 4 },
      ],
    },

    // ── 5. Air Max 270 ────────────────────────────────────────────────────────
    {
      name: 'Nike Air Max 270',
      brand: 'Nike',
      description:
        'Đơn vị Air 270 độ lớn nhất trong lịch sử dòng Air Max mang đến độ nảy và êm ái vượt trội. Phần cổ giày thấp thoải mái cho việc đi lại hàng ngày.',
      categoryId: catSneakers.id,
      tags: ['air-max', 'bestseller', 'cushioning'],
      images: [
        { url: img('Air Max 270 Black', '111111'), altText: 'Nike Air Max 270 Black', position: 0 },
        { url: img('Air Max 270 White', 'f0f0f0'), altText: 'Nike Air Max 270 White', position: 1 },
        { url: img('Air Max 270 Red', 'cc2200'), altText: 'Nike Air Max 270 University Red', position: 2 },
      ],
      variants: [
        { sku: 'NKM270-BLK-38', color: 'Black', size: '38', price: 3500000, stock: 6 },
        { sku: 'NKM270-BLK-39', color: 'Black', size: '39', price: 3500000, stock: 9 },
        { sku: 'NKM270-BLK-40', color: 'Black', size: '40', price: 3500000, stock: 12 },
        { sku: 'NKM270-BLK-41', color: 'Black', size: '41', price: 3500000, stock: 10 },
        { sku: 'NKM270-BLK-42', color: 'Black', size: '42', price: 3500000, stock: 7 },
        { sku: 'NKM270-BLK-43', color: 'Black', size: '43', price: 3500000, stock: 4 },
        { sku: 'NKM270-WHT-39', color: 'White', size: '39', price: 3500000, stock: 8 },
        { sku: 'NKM270-WHT-40', color: 'White', size: '40', price: 3500000, stock: 11 },
        { sku: 'NKM270-WHT-41', color: 'White', size: '41', price: 3500000, stock: 9 },
        { sku: 'NKM270-WHT-42', color: 'White', size: '42', price: 3500000, stock: 6 },
        { sku: 'NKM270-RED-40', color: 'University Red', size: '40', price: 3500000, compareAtPrice: 4000000, stock: 5 },
        { sku: 'NKM270-RED-41', color: 'University Red', size: '41', price: 3500000, compareAtPrice: 4000000, stock: 4 },
        { sku: 'NKM270-RED-42', color: 'University Red', size: '42', price: 3500000, compareAtPrice: 4000000, stock: 3 },
      ],
    },

    // ── 6. React Infinity Run Flyknit 3 ───────────────────────────────────────
    {
      name: 'Nike React Infinity Run Flyknit 3',
      brand: 'Nike',
      description:
        'Thiết kế để giảm nguy cơ chấn thương khi chạy. Đế React mang lại cảm giác đàn hồi tuyệt vời, phần trên Flyknit ôm chân hoàn hảo.',
      categoryId: catRunning.id,
      tags: ['running', 'injury-free', 'react', 'flyknit'],
      images: [
        { url: img('React Infinity 3 Black', '1a1a2e'), altText: 'Nike React Infinity Run 3 Black', position: 0 },
        { url: img('React Infinity 3 Blue', '0066cc'), altText: 'Nike React Infinity Run 3 Blue', position: 1 },
      ],
      variants: [
        { sku: 'NRI3-BLK-38', color: 'Black/White', size: '38', price: 3800000, stock: 5 },
        { sku: 'NRI3-BLK-39', color: 'Black/White', size: '39', price: 3800000, stock: 7 },
        { sku: 'NRI3-BLK-40', color: 'Black/White', size: '40', price: 3800000, stock: 9 },
        { sku: 'NRI3-BLK-41', color: 'Black/White', size: '41', price: 3800000, stock: 8 },
        { sku: 'NRI3-BLK-42', color: 'Black/White', size: '42', price: 3800000, stock: 5 },
        { sku: 'NRI3-BLK-43', color: 'Black/White', size: '43', price: 3800000, stock: 3 },
        { sku: 'NRI3-BLU-39', color: 'Blue/Orange', size: '39', price: 3800000, compareAtPrice: 4300000, stock: 6 },
        { sku: 'NRI3-BLU-40', color: 'Blue/Orange', size: '40', price: 3800000, compareAtPrice: 4300000, stock: 8 },
        { sku: 'NRI3-BLU-41', color: 'Blue/Orange', size: '41', price: 3800000, compareAtPrice: 4300000, stock: 6 },
        { sku: 'NRI3-BLU-42', color: 'Blue/Orange', size: '42', price: 3800000, compareAtPrice: 4300000, stock: 4 },
      ],
    },

    // ── 7. ZoomX Vaporfly Next% 2 ─────────────────────────────────────────────
    {
      name: 'Nike ZoomX Vaporfly Next% 2',
      brand: 'Nike',
      description:
        'Đôi giày race day của các vận động viên marathon chuyên nghiệp. Carbon fiber plate + ZoomX foam mang lại hiệu suất cao nhất, trọng lượng cực nhẹ.',
      categoryId: catRunning.id,
      tags: ['marathon', 'racing', 'carbon', 'elite', 'zoomx'],
      images: [
        { url: img('Vaporfly Next 2 Volt', 'b8cc00'), altText: 'Nike ZoomX Vaporfly Next% 2 Volt', position: 0 },
        { url: img('Vaporfly Next 2 Pink', 'e91e8c'), altText: 'Nike ZoomX Vaporfly Next% 2 Pink', position: 1 },
      ],
      variants: [
        { sku: 'NZVN2-VLT-38', color: 'Volt/Black', size: '38', price: 5500000, compareAtPrice: 6800000, stock: 3 },
        { sku: 'NZVN2-VLT-39', color: 'Volt/Black', size: '39', price: 5500000, compareAtPrice: 6800000, stock: 4 },
        { sku: 'NZVN2-VLT-40', color: 'Volt/Black', size: '40', price: 5500000, compareAtPrice: 6800000, stock: 5 },
        { sku: 'NZVN2-VLT-41', color: 'Volt/Black', size: '41', price: 5500000, compareAtPrice: 6800000, stock: 4 },
        { sku: 'NZVN2-VLT-42', color: 'Volt/Black', size: '42', price: 5500000, compareAtPrice: 6800000, stock: 3 },
        { sku: 'NZVN2-VLT-43', color: 'Volt/Black', size: '43', price: 5500000, compareAtPrice: 6800000, stock: 2 },
        { sku: 'NZVN2-PNK-39', color: 'Pink Blast', size: '39', price: 5500000, compareAtPrice: 6800000, stock: 3 },
        { sku: 'NZVN2-PNK-40', color: 'Pink Blast', size: '40', price: 5500000, compareAtPrice: 6800000, stock: 4 },
        { sku: 'NZVN2-PNK-41', color: 'Pink Blast', size: '41', price: 5500000, compareAtPrice: 6800000, stock: 3 },
        { sku: 'NZVN2-PNK-42', color: 'Pink Blast', size: '42', price: 5500000, compareAtPrice: 6800000, stock: 2 },
      ],
    },

    // ── 8. Blazer Mid '77 Vintage ─────────────────────────────────────────────
    {
      name: "Nike Blazer Mid '77 Vintage",
      brand: 'Nike',
      description:
        "Phong cách vintage từ những năm 70 với chi tiết 'crinkle' làm giày trông như đã qua sử dụng. Upper da, đế Waffle độc đáo.",
      categoryId: catCasual.id,
      tags: ['vintage', 'casual', 'classic', 'lifestyle'],
      images: [
        { url: img('Blazer Mid 77 White', 'f7f7f7'), altText: "Nike Blazer Mid '77 White", position: 0 },
        { url: img('Blazer Mid 77 Black', '1c1c1c'), altText: "Nike Blazer Mid '77 Black", position: 1 },
      ],
      variants: [
        { sku: 'NBM77-WHT-38', color: 'White/Black', size: '38', price: 2400000, stock: 8 },
        { sku: 'NBM77-WHT-39', color: 'White/Black', size: '39', price: 2400000, stock: 10 },
        { sku: 'NBM77-WHT-40', color: 'White/Black', size: '40', price: 2400000, stock: 12 },
        { sku: 'NBM77-WHT-41', color: 'White/Black', size: '41', price: 2400000, stock: 9 },
        { sku: 'NBM77-WHT-42', color: 'White/Black', size: '42', price: 2400000, stock: 6 },
        { sku: 'NBM77-WHT-43', color: 'White/Black', size: '43', price: 2400000, stock: 4 },
        { sku: 'NBM77-BLK-39', color: 'Black/White', size: '39', price: 2400000, stock: 7 },
        { sku: 'NBM77-BLK-40', color: 'Black/White', size: '40', price: 2400000, stock: 9 },
        { sku: 'NBM77-BLK-41', color: 'Black/White', size: '41', price: 2400000, stock: 7 },
        { sku: 'NBM77-BLK-42', color: 'Black/White', size: '42', price: 2400000, stock: 5 },
        { sku: 'NBM77-SAL-40', color: 'Sail/Gum', size: '40', price: 2600000, compareAtPrice: 3000000, stock: 4 },
        { sku: 'NBM77-SAL-41', color: 'Sail/Gum', size: '41', price: 2600000, compareAtPrice: 3000000, stock: 3 },
      ],
    },

    // ── 9. Air Zoom Pegasus 40 ────────────────────────────────────────────────
    {
      name: 'Nike Air Zoom Pegasus 40',
      brand: 'Nike',
      description:
        'Người bạn đồng hành tin cậy cho mọi buổi chạy. Phiên bản thứ 40 với React foam cải tiến, Air Zoom Unit nhỏ hơn nhưng phản hồi tốt hơn.',
      categoryId: catRunning.id,
      tags: ['running', 'daily-trainer', 'pegasus', 'versatile'],
      images: [
        { url: img('Pegasus 40 Black', '111827'), altText: 'Nike Pegasus 40 Black', position: 0 },
        { url: img('Pegasus 40 White', 'f9fafb'), altText: 'Nike Pegasus 40 White', position: 1 },
        { url: img('Pegasus 40 Navy', '1e3a5f'), altText: 'Nike Pegasus 40 Navy', position: 2 },
      ],
      variants: [
        { sku: 'NPG40-BLK-38', color: 'Black', size: '38', price: 3100000, stock: 8 },
        { sku: 'NPG40-BLK-39', color: 'Black', size: '39', price: 3100000, stock: 10 },
        { sku: 'NPG40-BLK-40', color: 'Black', size: '40', price: 3100000, stock: 13 },
        { sku: 'NPG40-BLK-41', color: 'Black', size: '41', price: 3100000, stock: 11 },
        { sku: 'NPG40-BLK-42', color: 'Black', size: '42', price: 3100000, stock: 8 },
        { sku: 'NPG40-BLK-43', color: 'Black', size: '43', price: 3100000, stock: 5 },
        { sku: 'NPG40-WHT-38', color: 'White', size: '38', price: 3100000, stock: 7 },
        { sku: 'NPG40-WHT-39', color: 'White', size: '39', price: 3100000, stock: 9 },
        { sku: 'NPG40-WHT-40', color: 'White', size: '40', price: 3100000, stock: 12 },
        { sku: 'NPG40-WHT-41', color: 'White', size: '41', price: 3100000, stock: 10 },
        { sku: 'NPG40-WHT-42', color: 'White', size: '42', price: 3100000, stock: 7 },
        { sku: 'NPG40-NVY-39', color: 'Navy', size: '39', price: 3100000, compareAtPrice: 3500000, stock: 6 },
        { sku: 'NPG40-NVY-40', color: 'Navy', size: '40', price: 3100000, compareAtPrice: 3500000, stock: 8 },
        { sku: 'NPG40-NVY-41', color: 'Navy', size: '41', price: 3100000, compareAtPrice: 3500000, stock: 6 },
        { sku: 'NPG40-NVY-42', color: 'Navy', size: '42', price: 3100000, compareAtPrice: 3500000, stock: 4 },
      ],
    },

    // ── 10. Air Jordan 4 Retro ────────────────────────────────────────────────
    {
      name: 'Nike Air Jordan 4 Retro',
      brand: 'Nike',
      description:
        'Thiết kế bởi Tinker Hatfield năm 1989 với cửa sổ Air nhìn thấy được lần đầu tiên. Lưới thông khí hai bên, thanh hỗ trợ phần trên đặc trưng.',
      categoryId: catBasketball.id,
      tags: ['jordan', 'basketball', 'hype', 'retro'],
      images: [
        { url: img('Jordan 4 White Cement', 'f0f0f0'), altText: 'Air Jordan 4 White Cement', position: 0 },
        { url: img('Jordan 4 Black Cat', '111111'), altText: 'Air Jordan 4 Black Cat', position: 1 },
        { url: img('Jordan 4 Military Blue', '4a6fa5'), altText: 'Air Jordan 4 Military Blue', position: 2 },
      ],
      variants: [
        { sku: 'NAJ4-WCE-40', color: 'White Cement', size: '40', price: 5800000, compareAtPrice: 7000000, stock: 2 },
        { sku: 'NAJ4-WCE-41', color: 'White Cement', size: '41', price: 5800000, compareAtPrice: 7000000, stock: 3 },
        { sku: 'NAJ4-WCE-42', color: 'White Cement', size: '42', price: 5800000, compareAtPrice: 7000000, stock: 2 },
        { sku: 'NAJ4-WCE-43', color: 'White Cement', size: '43', price: 5800000, compareAtPrice: 7000000, stock: 1 },
        { sku: 'NAJ4-BLK-40', color: 'Black Cat', size: '40', price: 5200000, stock: 3 },
        { sku: 'NAJ4-BLK-41', color: 'Black Cat', size: '41', price: 5200000, stock: 4 },
        { sku: 'NAJ4-BLK-42', color: 'Black Cat', size: '42', price: 5200000, stock: 3 },
        { sku: 'NAJ4-BLK-43', color: 'Black Cat', size: '43', price: 5200000, stock: 2 },
        { sku: 'NAJ4-MIL-40', color: 'Military Blue', size: '40', price: 5500000, compareAtPrice: 6500000, stock: 2 },
        { sku: 'NAJ4-MIL-41', color: 'Military Blue', size: '41', price: 5500000, compareAtPrice: 6500000, stock: 3 },
        { sku: 'NAJ4-MIL-42', color: 'Military Blue', size: '42', price: 5500000, compareAtPrice: 6500000, stock: 2 },
      ],
    },
  ];

  // ── Upsert all products ───────────────────────────────────────────────────
  for (const p of nikeProducts) {
    const slug = slugify(p.name);
    const { variants, images, ...productData } = p;

    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        ...productData,
        slug,
        images: { create: images },
        variants: {
          create: variants.map((v) => ({
            sku: v.sku,
            color: v.color,
            size: v.size,
            price: v.price,
            compareAtPrice: (v as any).compareAtPrice,
            stock: v.stock,
            isActive: true,
          })),
        },
      },
      include: { variants: true },
    });

    console.log(`✓ ${p.name} (${product.variants.length} variants)`);
  }

  console.log('\n✅ Nike seed complete!');
  console.log(`   Products : ${nikeProducts.length}`);
  console.log(`   Variants : ${nikeProducts.reduce((n, p) => n + p.variants.length, 0)}`);
  console.log(`   Categories: basketball, lifestyle (new) + sneakers, running, casual (existing)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
