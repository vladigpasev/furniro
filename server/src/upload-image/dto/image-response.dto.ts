import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ArrayMaxSize, Matches } from 'class-validator';

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

export class UploadImagesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Array of image files to be uploaded',
    isArray: true,
  })
  @IsNotEmpty({ message: 'Files are required' })
  @IsArray()
  @ArrayMaxSize(5, { message: 'You can upload up to 5 images' }) // Limit the number of images
  files: any[];

  @ApiProperty({
    description: 'Comma-separated list of image sizes to generate in the format WxH (e.g., "100x100,200x200")',
    example: '100x100,200x200',
  })
  @IsString()
  @Matches(/^(\d+x\d+)(,\d+x\d+)*$/, { message: 'Sizes must be in the format "WxH", comma-separated (e.g., "100x100,200x200")' })
  @IsNotEmpty({ message: 'Sizes are required' })
  @ArrayMaxSize(5, { message: 'You can provide up to 5 sizes per image' }) // Limit the number of sizes per image
  sizes: string;
}
