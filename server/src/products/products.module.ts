// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './product.schema';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from '../categories/category.module';  // Импортираме CategoryModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    CategoryModule,  // Тук импортираме модула за категории
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductsModule {}
