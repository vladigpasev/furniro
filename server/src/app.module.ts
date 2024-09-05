// src/app.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './categories/category.module';

@Module({
  imports: [
    DatabaseModule,
    ProductsModule,
    CategoryModule
  ],
})
export class AppModule {}
