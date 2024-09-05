import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ImageService } from './upload-image.service';
import { ImageController } from './upload-image.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // This stores the file in memory
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
