import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { ImageResponseDto, ResizedImageDto } from './dto/image-response.dto';

@Injectable()
export class ImageService {
  private readonly s3: S3Client;

  constructor() {
    // Initialize S3 client once and reuse
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('Missing AWS S3 credentials');
    }
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadImageToS3(file: Express.Multer.File, sizes: string[]): Promise<ImageResponseDto> {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    // Validating file type
    if (!validTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG and PNG are allowed.');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty or invalid');
    }

    const parsedSizes = this.parseAndValidateSizes(sizes);

    const uniqueFileName = uuidv4();

    // Optimize original image
    const compressedBuffer = await sharp(file.buffer)
      .resize({ width: 1080, height: 1080, fit: sharp.fit.inside, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const originalUrl = await this.uploadToS3(compressedBuffer, `original/${uniqueFileName}.jpeg`, 'image/jpeg');

    // Resizing all in parallel for better performance
    const resizedImages: ResizedImageDto[] = await Promise.all(
      parsedSizes.map(async (size) => this.resizeAndUpload(compressedBuffer, size, uniqueFileName))
    );

    return {
      original: originalUrl,
      resized: resizedImages,
    };
  }

  private async resizeAndUpload(buffer: Buffer, size: { width: number, height: number }, uniqueFileName: string): Promise<ResizedImageDto> {
    const resizedBuffer = await sharp(buffer)
      .resize(size.width, size.height, { fit: sharp.fit.cover, position: sharp.strategy.entropy })
      .toBuffer();

    const resizedUrl = await this.uploadToS3(resizedBuffer, `${size.width}x${size.height}/${uniqueFileName}.jpeg`, 'image/jpeg');

    return {
      width: size.width,
      height: size.height,
      url: resizedUrl,
    };
  }

  private async uploadToS3(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    };

    const upload = new Upload({ client: this.s3, params });

    const result = await upload.done();
    return result.Location;
  }

  private parseAndValidateSizes(sizes: string[]): { width: number, height: number }[] {
    const parsedSizes = sizes.map(size => {
      const [width, height] = size.split('x').map(Number);
      if (width > 1080 || height > 1080) {
        throw new BadRequestException(`Invalid size: ${width}x${height}. Maximum allowed dimensions are 1080x1080.`);
      }
      return { width, height };
    });

    return parsedSizes;
  }
}