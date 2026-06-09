import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateVariantDto } from './dto/create-variant.dto';
import { VariantsService } from './variants.service';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get(':variantId')
  findOne(@Param('variantId') variantId: string) {
    return this.variantsService.findById(variantId);
  }
}

@Controller('products/:productId/variants')
export class ProductVariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get()
  findAll(@Param('productId') productId: string) {
    return this.variantsService.findByProduct(productId);
  }

  @Post()
  create(@Param('productId') productId: string, @Body() dto: CreateVariantDto) {
    return this.variantsService.create(productId, dto);
  }
}
