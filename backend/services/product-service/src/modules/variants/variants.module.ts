import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VariantsController, ProductVariantsController } from './variants.controller';
import { VariantsService } from './variants.service';

@Module({
  controllers: [VariantsController, ProductVariantsController],
  providers: [VariantsService, PrismaService],
  exports: [VariantsService],
})
export class VariantsModule {}
