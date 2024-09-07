import { Schema, Document } from 'mongoose';

export interface Category extends Document {
  name: string;
  cover_photo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const CategorySchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 256 },
    cover_photo: { type: String },
  },
  { timestamps: true },
);
