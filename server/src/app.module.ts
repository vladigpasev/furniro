// src/app.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './categories/category.module';
import { ImageModule } from './upload-image/upload-image.module';

@Module({
  imports: [
    DatabaseModule,
    ProductsModule,
    CategoryModule,
    ImageModule
  ],
})
export class AppModule {}
