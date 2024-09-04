// src/products/product.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.schema';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() productData: Partial<Product>) {
    return this.productService.createProduct(productData);
  }

  @Get()
  async getAllProducts() {
    return this.productService.getAllProducts();
  }
}