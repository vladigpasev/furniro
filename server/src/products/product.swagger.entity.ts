import { ApiProperty } from '@nestjs/swagger';

export class ProductSwagger {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Wooden Chair',
  })
  name: string;

  @ApiProperty({
    description: 'A short description of the product',
    example: 'A sturdy chair',
  })
  short_description: string;

  @ApiProperty({
    description: 'A detailed description of the product',
    example: 'A sturdy wooden chair perfect for dining rooms.',
  })
  description: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 49.99,
  })
  price: number;

  @ApiProperty({
    description: 'The discount for the product (0-100)',
    example: 10,
    required: false,
  })
  discount?: number;

  @ApiProperty({
    description: 'The available quantity of the product',
    example: 100,
  })
  quality: number;

  @ApiProperty({
    description: 'Whether the product is marked as new',
    example: true,
    required: false,
  })
  mark_as_new?: boolean;

  @ApiProperty({
    description: 'The cover photo of the product',
    example: 'cover_photo_url.jpg',
  })
  cover_photo: string;

  @ApiProperty({
    description: 'Additional photos of the product',
    example: ['photo1.jpg', 'photo2.jpg'],
    required: false,
  })
  additional_photos?: string[];

  @ApiProperty({
    description: 'Available sizes for the product',
    example: ['S', 'M', 'L'],
    required: false,
  })
  sizes?: string[];

  @ApiProperty({
    description: 'Available colors for the product',
    example: ['brown', 'black', 'white'],
    required: false,
  })
  colors?: string[];
}
