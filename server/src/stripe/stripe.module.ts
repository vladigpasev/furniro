// src/stripe/stripe.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from '../orders/order.module'; // Import OrderModule

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => OrderModule), // Use forwardRef to prevent circular dependency
  ],
  providers: [StripeService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}
