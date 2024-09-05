import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to be uploaded',
  })
  @IsNotEmpty({ message: 'File is required' })
  file: any;

  @ApiProperty({
    description: 'Comma-separated list of image sizes to generate in the format WxH (e.g., "100x100,200x200")',
    example: '100x100,200x200',
    type: 'string',
  })
  @IsString()
  @Matches(/^(\d+x\d+)(,\d+x\d+)*$/, { message: 'Sizes must be in the format "WxH", comma-separated (e.g., "100x100,200x200")' })
  sizes: string;
}
