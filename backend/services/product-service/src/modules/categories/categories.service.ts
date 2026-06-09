import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { slugify } from '../../utils/slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { children: { where: { isActive: true } } },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: true },
    });
    if (!category) throw new NotFoundException(`Category "${slug}" not found`);
    return category;
  }

  async create(dto: CreateCategoryDto) {
    let slug = dto.slug ?? slugify(dto.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }
    return this.prisma.category.create({ data: { ...dto, slug } });
  }
}
