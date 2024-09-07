import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './review.schema';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Types } from 'mongoose';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review for a product' })
  @ApiResponse({
    status: 201,
    description: 'Review successfully created',
    type: CreateReviewDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return this.reviewService.createReview(createReviewDto);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: [CreateReviewDto],
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getReviewsForProduct(
    @Param('productId') productId: string,
  ): Promise<Review[]> {
    // Validate the product ID and return all related reviews
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID format');
    }
    return this.reviewService.getReviewsForProduct(productId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review by ID' })
  @ApiResponse({ status: 200, description: 'Review successfully deleted' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @HttpCode(204)
  async deleteReview(@Param('id') id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid review ID format');
    }
    await this.reviewService.deleteReview(id);
  }
}
