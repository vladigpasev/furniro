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
import { Product } from '../products/product.schema';
import { StripeService } from '../stripe/stripe.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    private readonly mailService: MailService,
  ) {}

  // Create a new order
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
          unit_price,
        };
      }),
    );

    const newOrder = new this.orderModel({
      ...createOrderDto,
      products: productsWithPrices,
      payed: false, // Set the initial payed state to false
      sent_reminder_email: false, // Set the reminder email status to false
    });

    const savedOrder = await newOrder.save();
    return savedOrder;
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

  // Get product by ID
  async getProductById(productId: Types.ObjectId): Promise<Product> {
    return this.productModel.findById(productId).exec();
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

  // Create a payment link using Stripe Checkout
  async createPaymentLink(orderId: Types.ObjectId): Promise<string> {
    const order = await this.getOrderById(orderId);

    // Convert ObjectId in products to string for Stripe
    const productsForCheckout = order.products.map((item) => ({
      product: item.product.toString(), // Convert ObjectId to string
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    // Prepare a compatible DTO for Stripe session
    const createOrderDto: CreateOrderDto = {
      ...order.toObject(), // Convert order to a plain object
      products: productsForCheckout,
    };

    const session = await this.stripeService.createCheckoutSession(
      createOrderDto, 
      'success_url', 
      'cancel_url'
    );
    return session.url;
  }

  // Send reminder emails for unpaid orders via cron job
  async sendReminderEmails(): Promise<void> {
    const orders = await this.getUnpaidOrders();

    for (const order of orders) {
      // Explicitly cast _id to ObjectId if necessary
      const orderIdObject: Types.ObjectId = order._id as Types.ObjectId;

      const paymentLink = await this.createPaymentLink(orderIdObject);

      // Send the reminder email to the customer
      await this.mailService.sendMail(
        order.email,
        'Payment Reminder',
        `Dear ${order.first_name}, please complete your payment.`,
        `<p>Dear <strong>${order.first_name}</strong>,<br>Please complete your payment <a href="${paymentLink}">here</a>.</p>`
      );

      // Mark the reminder as sent
      await this.markReminderSent(orderIdObject);
    }
  }
}