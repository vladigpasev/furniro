import { Injectable, BadRequestException, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel('Product') private readonly productModel: Model<Product>) { }

  async createProduct(data: CreateProductDto): Promise<Product> {
    try {
      const existingProduct = await this.productModel.findOne({ name: data.name }).exec();
      if (existingProduct) {
        throw new ConflictException(`Product with name ${data.name} already exists`);
      }
      const newProduct = new this.productModel(data);
      return await newProduct.save();
    } catch (error) {
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

  async getProductById(id: string): Promise<Product> {
    console.log(`Retrieving product with ID: ${id}`);

    if (!isValidObjectId(id)) {
      console.error(`Invalid product ID format: ${id}`);
      throw new BadRequestException(`Invalid product ID format: ${id}`);
    }

    const product = await this.productModel.findById(id).exec();

    if (!product) {
      console.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async updateProduct(id: string, updateData: UpdateProductDto): Promise<Product> {
    console.log(`Updating product with ID: ${id}`);

    if (!isValidObjectId(id)) {
      console.error(`Invalid product ID format: ${id}`);
      throw new BadRequestException(`Invalid product ID format: ${id}`);
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedProduct) {
      console.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    console.log(`Deleting product with ID: ${id}`);

    if (!isValidObjectId(id)) {
      console.error(`Invalid product ID format: ${id}`);
      throw new BadRequestException(`Invalid product ID format: ${id}`);
    }

    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      console.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
