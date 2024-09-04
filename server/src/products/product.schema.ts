// src/products/product.schema.ts
import { Schema, Document } from 'mongoose';

export interface Product extends Document {
  name: string;
  price: number;
  description: string;
}

export const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
});