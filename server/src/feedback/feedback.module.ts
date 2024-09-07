import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback, FeedbackSchema } from './feedback.schema';
import { MailService } from '../mail/mail.service'; // Import MailService

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Feedback.name, schema: FeedbackSchema }]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, MailService], // Add MailService to providers
})
export class FeedbackModule {}
