// src/products/product.swagger.entity.ts
import { ApiProperty } from '@nestjs/swagger';

// This is only for Swagger documentation purposes
export class ProductSwagger {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Wooden Chair',
  })
  name: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 49.99,
  })
  price: number;

  @ApiProperty({
    description: 'A brief description of the product',
    example: 'A sturdy wooden chair perfect for dining rooms.',
  })
  description: string;
}
