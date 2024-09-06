import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailOffersService } from './mail-offers.service';
import { MailOffersController } from './mail-offers.controller';
import { MailOffer, MailOfferSchema } from './mail-offers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MailOffer.name, schema: MailOfferSchema }]),
  ],
  controllers: [MailOffersController],
  providers: [MailOffersService],
})
export class MailOffersModule {}
