import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductSwagger } from './product.swagger.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    type: ProductSwagger,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products with filtering, sorting, and pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'categories',
    required: false,
    description: 'Array of Category IDs for filtering',
    type: [String],
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'createdAt', 'price'],
    description: 'Sort by name, creation date, or price',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order, ascending or descending',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of products',
    type: [ProductSwagger],
  })
  async getAllProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('categories') categories?: string[],
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ products: Product[]; totalCount: number }> {
    return this.productService.getAllProducts(
      page,
      limit,
      categories,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the product data',
    type: ProductSwagger,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id') id: string): Promise<Product> {
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID (Partial Update)' })
  @ApiResponse({
    status: 200,
    description: 'Product successfully updated',
    type: ProductSwagger,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateData: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.updateProduct(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiResponse({ status: 200, description: 'Product successfully deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(@Param('id') id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }
}
