import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

export interface HeroSlide {
  id: string;
  src: string;
  label: string;
  accent: string;
}

export interface HeroBannerDto {
  key: string;
  titleLeft: string;
  titleRight: string;
  subtitle: string;
  badge: string;
  watermark: string;
  productName: string;
  price: string;
  priceLabel: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaLink: string;
  slides: HeroSlide[];
  isActive: boolean;
}

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async getHero(key = 'main'): Promise<HeroBannerDto> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM hero_banners WHERE key = ${key} LIMIT 1
    `;
    if (!rows.length) throw new NotFoundException(`Hero banner "${key}" not found`);
    return this.mapRow(rows[0]);
  }

  async upsertHero(key = 'main', data: Partial<Omit<HeroBannerDto, 'key'>>): Promise<HeroBannerDto> {
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM hero_banners WHERE key = ${key} LIMIT 1
    `;

    if (existing.length) {
      const id = existing[0].id;
      await this.prisma.$executeRaw`
        UPDATE hero_banners SET
          "titleLeft"    = COALESCE(${data.titleLeft ?? null}, "titleLeft"),
          "titleRight"   = COALESCE(${data.titleRight ?? null}, "titleRight"),
          subtitle       = COALESCE(${data.subtitle ?? null}, subtitle),
          badge          = COALESCE(${data.badge ?? null}, badge),
          watermark      = COALESCE(${data.watermark ?? null}, watermark),
          "productName"  = COALESCE(${data.productName ?? null}, "productName"),
          price          = COALESCE(${data.price ?? null}, price),
          "priceLabel"   = COALESCE(${data.priceLabel ?? null}, "priceLabel"),
          description    = COALESCE(${data.description ?? null}, description),
          "ctaPrimary"   = COALESCE(${data.ctaPrimary ?? null}, "ctaPrimary"),
          "ctaSecondary" = COALESCE(${data.ctaSecondary ?? null}, "ctaSecondary"),
          "ctaLink"      = COALESCE(${data.ctaLink ?? null}, "ctaLink"),
          slides         = COALESCE(${data.slides ? JSON.stringify(data.slides) : null}::jsonb, slides),
          "isActive"     = COALESCE(${data.isActive ?? null}, "isActive"),
          "updatedAt"    = NOW()
        WHERE id = ${id}
      `;
    } else {
      const id = randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO hero_banners (id, key, "titleLeft", "titleRight", subtitle, badge, watermark,
          "productName", price, "priceLabel", description, "ctaPrimary", "ctaSecondary", "ctaLink", slides, "isActive")
        VALUES (
          ${id}, ${key},
          ${data.titleLeft ?? 'Jump'}, ${data.titleRight ?? 'man'},
          ${data.subtitle ?? ''}, ${data.badge ?? ''}, ${data.watermark ?? 'JORDAN'},
          ${data.productName ?? ''}, ${data.price ?? ''}, ${data.priceLabel ?? ''},
          ${data.description ?? ''}, ${data.ctaPrimary ?? 'Mua ngay'},
          ${data.ctaSecondary ?? 'Thêm vào giỏ'}, ${data.ctaLink ?? '/products'},
          ${JSON.stringify(data.slides ?? [])}::jsonb, ${data.isActive ?? true}
        )
      `;
    }

    return this.getHero(key);
  }

  private mapRow(row: any): HeroBannerDto {
    return {
      key: row.key,
      titleLeft: row.titleLeft,
      titleRight: row.titleRight,
      subtitle: row.subtitle,
      badge: row.badge,
      watermark: row.watermark,
      productName: row.productName,
      price: row.price,
      priceLabel: row.priceLabel,
      description: row.description,
      ctaPrimary: row.ctaPrimary,
      ctaSecondary: row.ctaSecondary,
      ctaLink: row.ctaLink,
      slides: Array.isArray(row.slides) ? row.slides : [],
      isActive: row.isActive,
    };
  }
}
