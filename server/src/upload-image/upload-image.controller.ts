import { Controller, Post, UploadedFile, UseInterceptors, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './upload-image.service';
import { ApiConsumes, ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Express } from 'express';
import { UploadImageDto } from './dto/upload-image.dto';
import { ImageResponseDto } from './dto/image-response.dto';

@ApiTags('Image Upload')
@Controller('upload')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload an image to AWS S3 with dynamic sizes' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Upload image file and sizes', type: UploadImageDto })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully', type: ImageResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Body() body: UploadImageDto): Promise<ImageResponseDto> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required and should be uploaded in memory');
    }

    // Парсване на размера в масив от низове
    const sizes = body.sizes.split(',').map(size => size.trim());

    return this.imageService.uploadImageToS3(file, sizes);
  }
}
