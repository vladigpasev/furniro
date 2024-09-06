// src/orders/order.service.ts
import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from '../products/product.schema';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @Inject(forwardRef(() => StripeService)) private readonly stripeService: StripeService,
  ) {}

  // Create an order after the Stripe webhook confirms payment
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const productsWithPrices = await Promise.all(
      createOrderDto.products.map(async (item) => {
        const product = await this.productModel.findById(item.product);
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.product} not found`);
        }

        const discount = product.discount || 0;
        const unit_price = product.price * ((100 - discount) / 100);

        return {
          product: product._id,
          quantity: item.quantity,
          unit_price: unit_price,
        };
      })
    );

    const newOrder = new this.orderModel({
      ...createOrderDto,
      products: productsWithPrices,
      payment_status: 'pending', // Initial payment status is pending
    });

    return newOrder.save();
  }

  // Create an order from the Stripe webhook after payment confirmation
  async createOrderFromWebhook(session: any): Promise<Order> {
    const orderData: CreateOrderDto = {
      products: [], // Products can be populated from session or metadata
      first_name: session.metadata.first_name,
      last_name: session.metadata.last_name,
      email: session.metadata.email,
      country: '', // Add as required
      city: '',
      address: '',
      postal_code: '',
      phone_number: '',
    };

    const newOrder = new this.orderModel({
      ...orderData,
      payment_status: 'paid', // Payment status set to paid
    });

    return newOrder.save();
  }

  // Retrieve all orders
  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.find().populate('products.product').exec();
  }

  // Retrieve a single order by ID
  async getOrderById(id: string): Promise<Order> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid order ID: ${id}`);
    }

    const order = await this.orderModel.findById(id).populate('products.product').exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  // Delete an order by ID
  async deleteOrder(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  // Fetch product details from the product ID
  async getProductById(productId: string): Promise<Product> {
    return this.productModel.findById(productId).exec();
  }
}
