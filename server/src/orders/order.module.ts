// src/orders/order.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './order.schema';
import { OrderService } from './order.service';
import { OrderController } from './order.controller'; // Import OrderController
import { ProductsModule } from '../products/products.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    ProductsModule,
    forwardRef(() => StripeModule),
  ],
  controllers: [OrderController], // Register OrderController here
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
