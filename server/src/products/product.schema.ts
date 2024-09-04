// src/products/product.schema.ts
import { Schema, Document } from 'mongoose';

export interface Product extends Document {
  name: string;
  short_description: string;
  description: string;
  price: number;
  discount?: number;
  quality: number;
  mark_as_new?: boolean;
  cover_photo: string;
  additional_photos?: string[];
  sizes?: string[];
  colors?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = new Schema({
  name: { type: String, required: true, unique: true, minlength: 3, maxlength: 512 },
  short_description: { type: String, required: true, minlength: 3, maxlength: 512 },
  description: { type: String, required: true, minlength: 32 },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, min: 0, max: 100 },
  quality: { type: Number, required: true, min: 0 },
  mark_as_new: { type: Boolean, default: false },
  cover_photo: { type: String, required: true },
  additional_photos: { type: [String], default: [] },
  sizes: { type: [String], default: [] },
  colors: { type: [String], default: [] },
}, { timestamps: true });
