import { Schema, Document, Types } from 'mongoose';

export interface Review extends Document {
  value: number;
  comment?: string;
  product: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ReviewSchema = new Schema(
  {
    value: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, minlength: 2, maxlength: 256 },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true },
);
