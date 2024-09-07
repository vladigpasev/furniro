import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer name' })
  @IsNotEmpty()
  @Length(2, 256)
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Customer email' })
  @IsNotEmpty()
  @IsEmail()
  @Length(2, 256)
  email: string;

  @ApiProperty({ example: 'Feedback subject', description: 'Feedback subject' })
  @IsNotEmpty()
  @Length(2, 256)
  subject: string;

  @ApiProperty({ example: 'This is the message of the feedback', description: 'Feedback message' })
  @IsNotEmpty()
  @Length(2, 2048)
  message: string;
}
