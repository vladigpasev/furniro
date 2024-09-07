import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback } from './feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
    private readonly mailService: MailService // Inject MailService
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const createdFeedback = new this.feedbackModel(createFeedbackDto);
    const feedback = await createdFeedback.save();

    // Send an email notification after successful feedback creation
    await this.mailService.sendMail(
      createFeedbackDto.email,
      'Feedback Received',
      `Dear ${createFeedbackDto.name},\n\nThank you for your feedback!\n\nBest regards,\nFurniro`
    );

    return feedback;
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackModel.find().exec();
  }

  async archive(id: string): Promise<Feedback> {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    feedback.archived = true;
    return feedback.save();
  }
}
