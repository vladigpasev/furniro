// src/products/products.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './product.schema';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from '../categories/category.module';
import { ReviewsModule } from '../reviews/review.module'; // Импортираме ReviewsModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    forwardRef(() => CategoryModule),
    forwardRef(() => ReviewsModule), // Добавяме ReviewsModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService, MongooseModule],
})
export class ProductsModule {}
