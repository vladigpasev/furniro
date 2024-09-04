// src/products/dto/create-product.dto.ts
import { IsString, IsNumber, IsOptional, IsNotEmpty, IsBoolean, IsInt, Min, Max, MinLength, MaxLength, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Wooden Chair',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(512)
  name: string;

  @ApiProperty({
    description: 'A short description of the product',
    example: 'A sturdy chair',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(512)
  short_description: string;

  @ApiProperty({
    description: 'A detailed description of the product',
    example: 'A sturdy wooden chair perfect for dining rooms.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  description: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 49.99,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'The discount for the product (0-100)',
    example: 10,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  discount?: number;

  @ApiProperty({
    description: 'The available quantity of the product',
    example: 100,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quality: number;

  @ApiProperty({
    description: 'Whether the product is marked as new',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  mark_as_new?: boolean;

  @ApiProperty({
    description: 'The cover photo of the product',
    example: 'cover_photo_url.jpg',
  })
  @IsString()
  @IsNotEmpty()
  cover_photo: string;

  @ApiProperty({
    description: 'Additional photos of the product',
    example: ['photo1.jpg', 'photo2.jpg'],
  })
  @IsArray()
  @IsOptional()
  additional_photos?: string[];

  @ApiProperty({
    description: 'Available sizes for the product',
    example: ['S', 'M', 'L'],
  })
  @IsArray()
  @IsOptional()
  sizes?: string[];

  @ApiProperty({
    description: 'Available colors for the product',
    example: ['brown', 'black', 'white'],
  })
  @IsArray()
  @IsOptional()
  colors?: string[];
}
