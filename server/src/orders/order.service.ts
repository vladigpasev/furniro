import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductService } from '../products/product.service'; // Separated Product logic into ProductService
import { StripeService } from '../stripe/stripe.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    private readonly productService: ProductService, // Injected ProductService
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    private readonly mailService: MailService,
  ) {}

  // Create a new order
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Extracted product fetching logic into ProductService
    const productsWithPrices = await this.productService.getProductsWithPrices(createOrderDto.products);

    const newOrder = new this.orderModel({
      ...createOrderDto,
      products: productsWithPrices,
      payed: false,
      sent_reminder_email: false,
    });

    return newOrder.save();
  }

  // Retrieve all orders
  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.find().populate('products.product').exec();
  }

  // Get an order by its ID
  async getOrderById(id: Types.ObjectId): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('products.product')
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  // Delete an order by its ID
  async deleteOrder(id: Types.ObjectId): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  // Update the payment status of an order
  async updateOrderPaymentStatus(orderId: Types.ObjectId, payed: boolean): Promise<void> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.payed = payed;
    await order.save();
  }

  // Get unpaid orders where the reminder email hasn't been sent
  async getUnpaidOrders(): Promise<Order[]> {
    return this.orderModel.find({ payed: false, sent_reminder_email: false }).exec();
  }

  // Mark that a reminder email has been sent for an order
  async markReminderSent(orderId: Types.ObjectId): Promise<void> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.sent_reminder_email = true;
    await order.save();
  }
}