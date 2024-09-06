// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './categories/category.module';
import { ImageModule } from './upload-image/upload-image.module';
import { MailOffersModule } from './mailchimp/mail-offers.module';
import { OrderModule } from './orders/order.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Make ConfigModule global so that ConfigService is available everywhere
    DatabaseModule,
    ProductsModule,
    CategoryModule,
    ImageModule,
    MailOffersModule,
    OrderModule,
    StripeModule,
  ],
})
export class AppModule {}
