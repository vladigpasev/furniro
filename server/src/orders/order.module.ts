import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './order.schema';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductsModule } from '../products/products.module';
import { StripeModule } from '../stripe/stripe.module';
import { OrderCron } from './order.cron';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    ProductsModule,
    forwardRef(() => StripeModule),
    MailModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderCron],
  exports: [OrderService],
})
export class OrderModule {}
