import { Schema, Document, Types } from 'mongoose';

export interface Order extends Document {
  _id: Types.ObjectId; // Ensure _id is typed as ObjectId
  products: Array<{
    product: Types.ObjectId;
    quantity: number;
    unit_price: number;
  }>;
  first_name: string;
  last_name: string;
  company_name?: string;
  country: string;
  city: string;
  address: string;
  postal_code: string;
  phone_number: string;
  email: string;
  additional_info?: string;
  payed: boolean;
  sent_reminder_email: boolean;
}

export const OrderSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        unit_price: { type: Number, required: true },
      },
    ],
    first_name: { type: String, required: true, minlength: 2, maxlength: 256 },
    last_name: { type: String, required: true, minlength: 2, maxlength: 256 },
    company_name: { type: String, minlength: 2, maxlength: 256 },
    country: { type: String, required: true, minlength: 2, maxlength: 256 },
    city: { type: String, required: true, minlength: 2, maxlength: 256 },
    address: { type: String, required: true, minlength: 2, maxlength: 512 },
    postal_code: { type: String, required: true, match: /^[0-9]{4}$/ },
    phone_number: { type: String, required: true, match: /^\+?[\d\s]{10,15}$/ },
    email: { type: String, required: true, match: /\S+@\S+\.\S+/ },
    additional_info: { type: String, maxlength: 1024 },
    payed: { type: Boolean, default: false },
    sent_reminder_email: { type: Boolean, default: false },
  },
  { timestamps: true },
);
