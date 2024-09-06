import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class MailOffer extends Document {
  @Prop({ required: true })
  email: string;
}

export const MailOfferSchema = SchemaFactory.createForClass(MailOffer);
