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

  // Метод с пагинация
  async getAllProducts(page: number = 1, limit: number = 10): Promise<{ products: Product[], totalCount: number }> {
    this.logger.log(`Fetching products, page: ${page}, limit: ${limit}`);

    // Проверка за негативни стойности на страницата и лимита
    if (page < 1 || limit < 1) {
      this.logger.error('Invalid pagination values');
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    try {
      // Изчисляване на колко продукти да пропуснем (offset)
      const skip = (page - 1) * limit;
      
      // Извличане на продуктите и общия брой
      const [products, totalCount] = await Promise.all([
        this.productModel.find().skip(skip).limit(limit).exec(),
        this.productModel.countDocuments().exec(),
      ]);

      return { products, totalCount };
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
