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
import { ProductService } from '../products/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    private readonly productService: ProductService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const productsWithPrices = await this.productService.getProductsWithPrices(
      createOrderDto.products,
    );

    const newOrder = new this.orderModel({
      ...createOrderDto,
      products: productsWithPrices,
      payed: false,
      sent_reminder_email: false,
    });

    return newOrder.save();
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ID: ${id}`);
    }
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.find().populate('products.product').exec();
  }

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

  async deleteOrder(id: Types.ObjectId): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  async updateOrderPaymentStatus(
    orderId: Types.ObjectId,
    payed: boolean,
  ): Promise<void> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.payed = payed;
    await order.save();
  }

  async getUnpaidOrders(): Promise<Order[]> {
    return this.orderModel
      .find({ payed: false, sent_reminder_email: false })
      .exec();
  }

  async markReminderSent(orderId: Types.ObjectId): Promise<void> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.sent_reminder_email = true;
    await order.save();
  }
}
