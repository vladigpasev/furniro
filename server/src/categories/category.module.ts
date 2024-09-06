import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './category.schema';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { ProductsModule } from '../products/products.module'; // Импортираме ProductsModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
    forwardRef(() => ProductsModule),  // Използваме forwardRef, за да избегнем цикличната зависимост
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService, MongooseModule],  // Експортираме модела и услугата за употреба в други модули
})
export class CategoryModule {}
