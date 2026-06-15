import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddImageDto } from './dto/add-image.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm với filter và pagination' })
  search(@Query() query: SearchProductDto) {
    return this.productsService.search(query);
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Chi tiết sản phẩm theo ID (Admin)' })
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Chi tiết sản phẩm theo slug' })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới (Admin)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật sản phẩm (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Post(':slug/images')
  @ApiOperation({ summary: 'Thêm ảnh cho sản phẩm (URL)' })
  addImage(@Param('slug') slug: string, @Body() dto: AddImageDto) {
    return this.productsService.addImage(slug, dto.url, dto.altText, dto.position);
  }
}
