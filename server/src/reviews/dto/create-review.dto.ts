// src/reviews/dto/create-review.dto.ts
import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'The rating value for the review',
    example: 5,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  value: number;

  @ApiProperty({
    description: 'The optional comment for the review',
    example: 'Great product!',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(256)
  comment?: string;

  @ApiProperty({
    description: 'The product ID associated with this review',
    example: '64e73458dfb1a820b5b47e07',
  })
  @IsString()
  @IsNotEmpty()
  product: string;
}
