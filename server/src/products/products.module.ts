import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './product.schema';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from '../categories/category.module'; // Импортираме CategoryModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    forwardRef(() => CategoryModule),  // Използваме forwardRef, за да избегнем цикличната зависимост
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService, MongooseModule],  // Експортираме модела и услугата за употреба в други модули
})
export class ProductsModule {}
