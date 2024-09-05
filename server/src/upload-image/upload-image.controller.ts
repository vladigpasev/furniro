import { Controller, Post, UploadedFiles, UseInterceptors, Body, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageService } from './upload-image.service';
import { ApiConsumes, ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Express } from 'express';
import { UploadImagesDto } from './dto/upload-image.dto';
import { ImageResponseDto } from './dto/image-response.dto';

@ApiTags('Image Upload')
@Controller('upload')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload multiple images to AWS S3 with dynamic sizes' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Upload image files and sizes', type: UploadImagesDto })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully', type: [ImageResponseDto] })
  @UseInterceptors(FilesInterceptor('files', 5)) // Ограничаваме броя на файловете до 5
  async uploadImages(@UploadedFiles() files: Express.Multer.File[], @Body() body: UploadImagesDto): Promise<ImageResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    // Парсване на размера в масив от низове
    const sizes = body.sizes.split(',').map(size => size.trim());

    if (sizes.length > 5) {
      throw new BadRequestException('You can provide up to 5 sizes per image');
    }

    // Качваме всяко изображение и връщаме резултатите
    return Promise.all(files.map(file => this.imageService.uploadImageToS3(file, sizes)));
  }
}
