// src/categories/dto/create-category.dto.ts
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Living Room Furniture',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  name: string;

  @ApiProperty({
    description: 'Cover photo of the category',
    example: 'cover_photo_url.jpg',
  })
  @IsString()
  @IsOptional()
  cover_photo?: string;
}