import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMailOfferDto {
  @ApiProperty({
    description: 'Email address to subscribe',
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
