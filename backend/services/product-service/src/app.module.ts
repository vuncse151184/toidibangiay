import { Module } from '@nestjs/common';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { VariantsModule } from './modules/variants/variants.module';
import { BannersModule } from './modules/banners/banners.module';

@Module({
  imports: [ProductsModule, CategoriesModule, VariantsModule, BannersModule],
})
export class AppModule {}
