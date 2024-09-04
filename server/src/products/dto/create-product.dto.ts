// src/products/dto/create-product.dto.ts
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Wooden Chair',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 49.99,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'A brief description of the product',
    example: 'A sturdy wooden chair perfect for dining rooms.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
