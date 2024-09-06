import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, SortOrder } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/category.schema'; // Импортираме категорията

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('Category') private readonly categoryModel: Model<Category>, // Добавяме категорията
  ) {}

  // Проверка дали дадена категория съществува
  private async validateCategoryExists(categoryId: string) {
    if (!isValidObjectId(categoryId)) {
      throw new BadRequestException(
        `Invalid category ID format: ${categoryId}`,
      );
    }
    const categoryExists = await this.categoryModel.exists({ _id: categoryId });
    if (!categoryExists) {
      throw new BadRequestException(
        `Category with ID ${categoryId} does not exist`,
      );
    }
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    this.logger.log('Creating new product');

    // Проверяваме дали категорията съществува
    if (data.category) {
      await this.validateCategoryExists(data.category);
    }

    try {
      const newProduct = new this.productModel(data);
      return await newProduct.save();
    } catch (error) {
      this.logger.error('Failed to create product', error.stack);
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async updateProduct(
    id: string,
    updateData: UpdateProductDto,
  ): Promise<Product> {
    this.logger.log(`Updating product with ID: ${id}`);

    if (!isValidObjectId(id)) {
      this.logger.error(`Invalid product ID format: ${id}`);
      throw new BadRequestException(`Invalid product ID format: ${id}`);
    }

    // Проверяваме дали категорията съществува при актуализиране
    if (updateData.category) {
      await this.validateCategoryExists(updateData.category);
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedProduct) {
      this.logger.warn(`Product with ID ${id} not found`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return updatedProduct;
  }

  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    categories?: string[],
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ products: Product[]; totalCount: number }> {
    this.logger.log(
      `Fetching products, page: ${page}, limit: ${limit}, categories: ${categories}, sortBy: ${sortBy}, sortOrder: ${sortOrder}`,
    );

    if (page < 1 || limit < 1) {
      this.logger.error('Invalid pagination values');
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    const skip = (page - 1) * limit;

    const query = categories?.length ? { category: { $in: categories } } : {};
    const sort: Record<string, SortOrder> = { [sortBy]: sortOrder };

    try {
      const [products, totalCount] = await Promise.all([
        this.productModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
        this.productModel.countDocuments(query).exec(),
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
