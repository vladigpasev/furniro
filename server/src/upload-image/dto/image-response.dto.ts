import { ApiProperty } from '@nestjs/swagger';

export class ResizedImageDto {
  @ApiProperty({ description: 'Width of the resized image', example: 381 })
  width: number;

  @ApiProperty({ description: 'Height of the resized image', example: 480 })
  height: number;

  @ApiProperty({
    description: 'URL of the resized image',
    example: 'https://example.com/381x480/image.jpeg',
  })
  url: string;
}

export class ImageResponseDto {
  @ApiProperty({ description: 'URL of the original image', example: 'https://example.com/original/image.jpeg' })
  original: string;

  @ApiProperty({
    description: 'Array of resized images with their dimensions',
    type: [ResizedImageDto],
  })
  resized: ResizedImageDto[];
}
