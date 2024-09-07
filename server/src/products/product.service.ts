import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, SortOrder } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/category.schema';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  private readonly errors = {
    INVALID_ID: (id: string) => `Invalid ID format: ${id}`,
    PRODUCT_NOT_FOUND: (id: string) => `Product with ID ${id} not found`,
    CATEGORY_NOT_FOUND: (id: string) => `Category with ID ${id} not found`,
  };

  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
  ) {}

  private validateObjectId(id: string, entity: string = 'Product') {
    if (!isValidObjectId(id)) {
      this.logger.error(`Invalid ${entity} ID format: ${id}`);
      throw new BadRequestException(this.errors.INVALID_ID(id));
    }
  }

  private async validateCategoryExists(categoryId: string) {
    this.validateObjectId(categoryId, 'Category');
    const categoryExists = await this.categoryModel.exists({ _id: categoryId });
    if (!categoryExists) {
      throw new NotFoundException(this.errors.CATEGORY_NOT_FOUND(categoryId));
    }
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    this.logger.log('Creating new product');

    if (data.category) {
      await this.validateCategoryExists(data.category);
    }

    try {
      const newProduct = new this.productModel(data);
      const savedProduct = await newProduct.save();
      this.logger.log('Product created successfully');
      return savedProduct;
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

    this.validateObjectId(id);

    if (updateData.category) {
      await this.validateCategoryExists(updateData.category);
    }

    try {
      const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .lean()
        .exec();

      if (!updatedProduct) {
        this.logger.warn(this.errors.PRODUCT_NOT_FOUND(id));
        throw new NotFoundException(this.errors.PRODUCT_NOT_FOUND(id));
      }

      this.logger.log(`Product with ID: ${id} updated successfully`);
      return updatedProduct;
    } catch (error) {
      this.logger.error(`Failed to update product with ID: ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    categories?: string[],
    sortBy: string = 'createdAt',
    sortOrder: SortOrder = 'desc',
  ): Promise<{ products: Product[]; totalCount: number }> {
    this.logger.log(
      `Fetching products, page: ${page}, limit: ${limit}, categories: ${categories}, sortBy: ${sortBy}, sortOrder: ${sortOrder}`,
    );

    const sanitizedLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * sanitizedLimit;

    const query = categories?.length ? { category: { $in: categories } } : {};
    const sort: Record<string, SortOrder> = { [sortBy]: sortOrder };

    try {
      const [products, totalCount] = await Promise.all([
        this.productModel
          .find(query)
          .sort(sort)
          .skip(skip)
          .limit(sanitizedLimit)
          .lean()
          .exec(),
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

    this.validateObjectId(id);

    try {
      const product = await this.productModel.findById(id).lean().exec();
      if (!product) {
        this.logger.warn(this.errors.PRODUCT_NOT_FOUND(id));
        throw new NotFoundException(this.errors.PRODUCT_NOT_FOUND(id));
      }

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve product with ID: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve product');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    this.logger.log(`Deleting product with ID: ${id}`);

    this.validateObjectId(id);

    try {
      const result = await this.productModel.findByIdAndDelete(id).exec();
      if (!result) {
        this.logger.warn(this.errors.PRODUCT_NOT_FOUND(id));
        throw new NotFoundException(this.errors.PRODUCT_NOT_FOUND(id));
      }

      this.logger.log(`Successfully deleted product with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete product with ID: ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  async getProductsWithPrices(
    products: Array<{ product: string; quantity: number }>,
  ) {
    return Promise.all(
      products.map(async (item) => {
        const product = await this.productModel
          .findById(item.product)
          .lean()
          .exec();
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.product} not found`,
          );
        }

        const discount = product.discount || 0;
        const unit_price = product.price * ((100 - discount) / 100);

        return {
          product: product._id,
          quantity: item.quantity,
          unit_price,
        };
      }),
    );
  }
}
