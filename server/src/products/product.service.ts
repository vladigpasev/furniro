import { Injectable, BadRequestException, ConflictException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(@InjectModel('Product') private readonly productModel: Model<Product>) {}

  async createProduct(data: CreateProductDto): Promise<Product> {
    this.logger.log('Creating new product');
    const existingProduct = await this.productModel.findOne({ name: data.name }).exec();
    if (existingProduct) {
      this.logger.warn(`Product with name ${data.name} already exists`);
      throw new ConflictException(`Product with name ${data.name} already exists`);
    }
    
    try {
      const newProduct = new this.productModel(data);
      return await newProduct.save();
    } catch (error) {
      this.logger.error('Failed to create product', error.stack);
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async getAllProducts(): Promise<Product[]> {
    this.logger.log('Fetching all products');
    try {
      return await this.productModel.find().exec();
    } catch (error) {
      this.logger.error('Failed to retrieve products', error.stack);
      throw new InternalServerErrorException('Failed to retrieve products');
    }
  }

  async getProductById(id: string): Promise<Product> {
    this.logger.log(`Retrieving product with ID: ${id}`);

    if (!isValidObjectId(id)) {
      this.logger.error(`Invalid product ID format: ${id}`);
      throw new BadRequestException(`Invalid product ID format: ${id}`);
    }

    const product = await this.productModel.findById(id).exec();
    if (!product) {
      this.logger.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async updateProduct(id: string, updateData: UpdateProductDto): Promise<Product> {
    this.logger.log(`Updating product with ID: ${id}`);

    if (!isValidObjectId(id)) {
      this.logger.error(`Invalid product ID format: ${id}`);
      throw new BadRequestException(`Invalid product ID format: ${id}`);
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedProduct) {
      this.logger.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    this.logger.log(`Deleting product with ID: ${id}`);

    if (!isValidObjectId(id)) {
      this.logger.error(`Invalid product ID format: ${id}`);
      throw new BadRequestException(`Invalid product ID format: ${id}`);
    }

    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      this.logger.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.logger.log(`Successfully deleted product with ID: ${id}`);
  }
}
