import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Feedback extends Document {
  @Prop({ required: true, minlength: 2, maxlength: 256 })
  name: string;

  @Prop({ required: true, minlength: 2, maxlength: 256, match: /.+\@.+\..+/ })
  email: string;

  @Prop({ required: true, minlength: 2, maxlength: 256 })
  subject: string;

  @Prop({ required: true, minlength: 2, maxlength: 2048 })
  message: string;

  @Prop({ default: false })
  archived: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
