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

  // Create a new email entry and add it to Mailchimp
  async create(createMailOfferDto: CreateMailOfferDto): Promise<MailOffer> {
    const createdMailOffer = new this.mailOfferModel(createMailOfferDto);
    await this.addEmailToMailchimp(createMailOfferDto.email);
    return createdMailOffer.save();
  }

  // Add an email to Mailchimp list
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

  // Delete an email from MongoDB and Mailchimp
  async delete(email: string): Promise<void> {
    // Remove email from MongoDB
    const result = await this.mailOfferModel.findOneAndDelete({ email });
    if (!result) {
      throw new NotFoundException(`Email ${email} not found`);
    }

    // Remove email from Mailchimp
    await this.removeEmailFromMailchimp(email);
  }

  // Remove an email from Mailchimp list
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

  // Mailchimp uses MD5 hash of email to identify the subscriber
  getSubscriberHash(email: string) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }
}
