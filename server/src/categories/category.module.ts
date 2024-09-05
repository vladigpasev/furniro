// src/categories/category.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './category.schema';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),  // Регистрираме модела
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [MongooseModule],  // Експортираме MongooseModule с модела, за да е достъпен в други модули
})
export class CategoryModule {}
