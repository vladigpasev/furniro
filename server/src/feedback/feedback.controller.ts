import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit customer feedback' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully.' })
  async create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all feedbacks' })
  @ApiResponse({
    status: 200,
    description: 'Feedback list retrieved successfully.',
  })
  async findAll() {
    return this.feedbackService.findAll();
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive feedback' })
  @ApiResponse({ status: 200, description: 'Feedback archived successfully.' })
  async archive(@Param('id') id: string) {
    return this.feedbackService.archive(id);
  }
}
