import { Controller, Get, Param, Delete, NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderSwagger } from './order.swagger.entity';
import { Order } from './order.schema';
import { Types } from 'mongoose'; // Import Mongoose Types for ObjectId handling

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all orders' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: [OrderSwagger],
  })
  async getAllOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderSwagger,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') id: string): Promise<Order> {
    // Validate if 'id' is a valid ObjectId
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid order ID: ${id}`);
    }

    // Convert the string 'id' to an ObjectId before passing to the service
    const objectId = new Types.ObjectId(id);
    return this.orderService.getOrderById(objectId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order by ID' })
  @ApiResponse({ status: 204, description: 'Order successfully deleted' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async deleteOrder(@Param('id') id: string): Promise<void> {
    // Validate if 'id' is a valid ObjectId
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid order ID: ${id}`);
    }

    // Convert the string 'id' to an ObjectId before passing to the service
    const objectId = new Types.ObjectId(id);
    await this.orderService.deleteOrder(objectId);
  }
}