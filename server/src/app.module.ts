import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './categories/category.module';
import { ImageModule } from './upload-image/upload-image.module';
import { MailOffersModule } from './mailchimp/mail-offers.module';
import { OrderModule } from './orders/order.module';
import { StripeModule } from './stripe/stripe.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './mail/mail.module'; // Import MailModule
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ProductsModule,
    CategoryModule,
    ImageModule,
    MailOffersModule,
    OrderModule,
    StripeModule,
    ScheduleModule.forRoot(),
    MailModule, // Include MailModule
    FeedbackModule
  ],
})
export class AppModule {}
