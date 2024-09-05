import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { ImageResponseDto } from './dto/image-response.dto';

@Injectable()
export class ImageService {
  private readonly s3: S3Client;

  constructor() {
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

    if (!validTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG and PNG are allowed.');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty or invalid');
    }

    const uniqueFileName = uuidv4();
    const compressedBuffer = await sharp(file.buffer)
      .resize({ 
        width: 1080, 
        height: 1080, 
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Парсване на низовете в обекти { width, height }
    const parsedSizes = sizes.map(size => {
      const [width, height] = size.split('x').map(Number);
      return { width, height };
    });

    const originalUrl = await this.uploadToS3(compressedBuffer, `original/${uniqueFileName}.jpeg`, 'image/jpeg');

    const resizedImages = await Promise.all(
      parsedSizes.map(async (size) => {
        const resizedBuffer = await sharp(compressedBuffer)
          .resize(size.width, size.height, {
            fit: sharp.fit.cover,
            position: sharp.strategy.entropy,
          })
          .toBuffer();

        const resizedUrl = await this.uploadToS3(resizedBuffer, `${size.width}x${size.height}/${uniqueFileName}.jpeg`, 'image/jpeg');

        return {
          width: size.width,
          height: size.height,
          url: resizedUrl,
        };
      }),
    );

    return {
      original: originalUrl,
      resized: resizedImages,
    };
  }

  private async uploadToS3(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    };

    const upload = new Upload({
      client: this.s3,
      params,
    });

    const result = await upload.done();
    return result.Location;
  }
}