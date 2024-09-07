import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from './order.service';
import { MailService } from '../mail/mail.service';
import { StripeService } from '../stripe/stripe.service';
import { Types } from 'mongoose';

@Injectable()
export class OrderCron {
  private readonly logger = new Logger(OrderCron.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly mailService: MailService,
    private readonly stripeService: StripeService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  async sendReminderEmails() {
    const orders = await this.orderService.getUnpaidOrders();

    for (const order of orders) {
      this.logger.log(`Processing order with _id: ${order._id}`);

      if (!Types.ObjectId.isValid(order._id)) {
        this.logger.error(`Invalid ObjectId: ${order._id}. Skipping.`);
        continue;
      }

      try {
        const successUrl = `https://yourdomain.com/success`;
        const cancelUrl = `https://yourdomain.com/cancel`;
        const discount = 3;

        const session = await this.stripeService.createCheckoutSession(
          { ...order.toObject(), products: order.products },
          successUrl,
          cancelUrl,
          discount,
          true,
          order._id.toString(),
        );

        await this.mailService.sendMail(
          order.email,
          'Payment Reminder - Special Discount!',
          `Dear ${order.first_name}, please complete your payment and enjoy a 3% discount.`,
          `<p>Dear <strong>${order.first_name}</strong>,<br>We noticed your order is still pending payment. Please complete your payment <a href="${session.url}">here</a> and enjoy an exclusive 3% discount.</p>`,
        );

        await this.orderService.markReminderSent(order._id);
      } catch (error) {
        this.logger.error(
          `Failed to process reminder for order ${order._id}: ${error.message}`,
        );
      }
    }
  }
}
