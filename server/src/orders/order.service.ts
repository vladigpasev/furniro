// src/orders/order.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from '../products/product.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('Product') private readonly productModel: Model<Product>,  // Добавяме модела за продуктите
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const productsWithPrices = await Promise.all(
      createOrderDto.products.map(async (item) => {
        const product = await this.productModel.findById(item.product);
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.product} not found`);
        }

        // Изчисляваме цената на продукта с отстъпка
        const discount = product.discount || 0;
        const unit_price = product.price * ((100 - discount) / 100);

        return {
          product: product._id,
          quantity: item.quantity,
          unit_price: unit_price, // Добавяме единичната цена към поръчката
        };
      })
    );

    const newOrder = new this.orderModel({
      ...createOrderDto,
      products: productsWithPrices, // Продуктите вече съдържат изчислената единична цена
    });

    return newOrder.save();
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.find().populate('products.product').exec();
  }

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

  async updateOrder(id: string, updateData: Partial<CreateOrderDto>): Promise<Order> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return updatedOrder;
  }

  async deleteOrder(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}
