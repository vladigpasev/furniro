import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ArrayMaxSize, ArrayMinSize, Matches } from 'class-validator';

export class UploadImagesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Array of image files to be uploaded',
    isArray: true, // Указваме, че ще качваме множество файлове
  })
  @IsNotEmpty({ message: 'Files are required' })
  @IsArray()
  @ArrayMaxSize(5, { message: 'You can upload up to 5 images' }) // Лимит на броя изображения
  files: any[];

  @ApiProperty({
    description: 'Comma-separated list of image sizes to generate in the format WxH (e.g., "100x100,200x200")',
    example: '100x100,200x200',
  })
  @IsString()
  @Matches(/^(\d+x\d+)(,\d+x\d+)*$/, { message: 'Sizes must be in the format "WxH", comma-separated (e.g., "100x100,200x200")' })
  @IsNotEmpty({ message: 'Sizes are required' })
  @ArrayMaxSize(5, { message: 'You can provide up to 5 sizes per image' }) // Лимит на броя размери
  sizes: string;
}