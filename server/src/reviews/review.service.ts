// src/reviews/review.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Review } from './review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { Product } from '../products/product.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel('Review') private readonly reviewModel: Model<Review>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  private async validateProductExists(productId: string) {
    if (!isValidObjectId(productId)) {
      throw new BadRequestException(`Invalid product ID format: ${productId}`);
    }
    const productExists = await this.productModel.exists({ _id: productId });
    if (!productExists) {
      throw new NotFoundException(`Product with ID ${productId} does not exist`);
    }
  }

  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
    await this.validateProductExists(createReviewDto.product);

    const newReview = new this.reviewModel(createReviewDto);
    return newReview.save();
  }

  async getReviewsForProduct(productId: string): Promise<Review[]> {
    await this.validateProductExists(productId);
    return this.reviewModel.find({ product: productId }).exec();
  }

  async deleteReview(id: string): Promise<void> {
    const result = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
  }
}
