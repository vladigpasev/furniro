// src/products/product.schema.ts
import { Schema, Document } from 'mongoose';

export interface Product extends Document {
  name: string;
  price: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
}, { timestamps: true });
