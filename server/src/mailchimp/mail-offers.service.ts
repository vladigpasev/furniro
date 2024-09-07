import * as mailchimp from '@mailchimp/mailchimp_marketing';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailOffer } from './mail-offers.schema';
import { CreateMailOfferDto } from './dto/create-mail-offer.dto';

@Injectable()
export class MailOffersService {
  constructor(
    @InjectModel(MailOffer.name) private mailOfferModel: Model<MailOffer>,
  ) {}

  async create(createMailOfferDto: CreateMailOfferDto): Promise<MailOffer> {
    const createdMailOffer = new this.mailOfferModel(createMailOfferDto);
    await this.addEmailToMailchimp(createMailOfferDto.email);
    return createdMailOffer.save();
  }

  async addEmailToMailchimp(email: string) {
    try {
      const response = await mailchimp.lists.addListMember('YOUR_LIST_ID', {
        email_address: email,
        status: 'subscribed',
      });
      console.log('Mailchimp response:', response);
    } catch (error) {
      console.error('Error adding email to Mailchimp:', error);
    }
  }

  async delete(email: string): Promise<void> {
    const result = await this.mailOfferModel.findOneAndDelete({ email });
    if (!result) {
      throw new NotFoundException(`Email ${email} not found`);
    }

    await this.removeEmailFromMailchimp(email);
  }

  async removeEmailFromMailchimp(email: string) {
    try {
      const subscriberHash = this.getSubscriberHash(email);
      const response = await mailchimp.lists.deleteListMember(
        'YOUR_LIST_ID',
        subscriberHash,
      );
      console.log('Mailchimp response:', response);
    } catch (error) {
      console.error('Error removing email from Mailchimp:', error);
    }
  }

  getSubscriberHash(email: string) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }
}
