import { Module, forwardRef } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from '../orders/order.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ConfigModule, forwardRef(() => OrderModule), ProductsModule],
  providers: [StripeService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}
