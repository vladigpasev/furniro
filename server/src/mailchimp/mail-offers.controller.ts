import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { MailOffersService } from './mail-offers.service';
import { CreateMailOfferDto } from './dto/create-mail-offer.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Mail Offers')
@Controller('mail-offers')
export class MailOffersController {
  constructor(private readonly mailOffersService: MailOffersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new email subscription' })
  @ApiResponse({
    status: 201,
    description: 'Email successfully added to database and Mailchimp.',
  })
  @ApiResponse({ status: 400, description: 'Bad request, email not valid.' })
  async create(@Body() createMailOfferDto: CreateMailOfferDto) {
    return this.mailOffersService.create(createMailOfferDto);
  }

  @Delete(':email')
  @ApiOperation({ summary: 'Unsubscribe an email from the list' })
  @ApiResponse({
    status: 200,
    description: 'Email successfully removed from database and Mailchimp.',
  })
  @ApiResponse({ status: 404, description: 'Email not found.' })
  async unsubscribe(@Param('email') email: string) {
    return this.mailOffersService.delete(email);
  }
}
