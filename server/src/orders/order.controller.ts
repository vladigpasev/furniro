import { Controller, Post, Get, Param, Body, Patch, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.schema'; // This remains for typing purposes
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderSwagger } from './order.swagger.entity'; // This will be the class used in Swagger

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderSwagger })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully', type: [OrderSwagger] })
  async getAllOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully', type: OrderSwagger })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') id: string): Promise<Order> {
    return this.orderService.getOrderById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order by ID' })
  @ApiResponse({ status: 200, description: 'Order updated successfully', type: OrderSwagger })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrder(@Param('id') id: string, @Body() updateData: Partial<CreateOrderDto>): Promise<Order> {
    return this.orderService.updateOrder(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order by ID' })
  @ApiResponse({ status: 204, description: 'Order successfully deleted' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async deleteOrder(@Param('id') id: string): Promise<void> {
    await this.orderService.deleteOrder(id);
  }
}
