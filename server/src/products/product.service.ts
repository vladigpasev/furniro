// src/products/product.service.ts
import { Injectable, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel('Product') private readonly productModel: Model<Product>) {}

  async createProduct(data: CreateProductDto): Promise<Product> {
    try {
      // Check if product with the same name exists
      const existingProduct = await this.productModel.findOne({ name: data.name }).exec();
      if (existingProduct) {
        throw new ConflictException(`Product with name ${data.name} already exists`);
      }

      const newProduct = new this.productModel(data);
      return await newProduct.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.productModel.find().exec();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve products');
    }
  }
}
