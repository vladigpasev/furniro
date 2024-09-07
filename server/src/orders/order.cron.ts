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
    private readonly stripeService: StripeService, // Inject StripeService here
  ) {}

  @Cron(CronExpression.EVERY_HOUR) // Adjust the cron timing if necessary
  async sendReminderEmails() {
    const orders = await this.orderService.getUnpaidOrders();

    for (const order of orders) {
      this.logger.log(`Processing order with _id: ${JSON.stringify(order._id)}`);

      // Ensure _id is valid and cast it to ObjectId
      if (!Types.ObjectId.isValid(order._id)) {
        this.logger.error(`Invalid ObjectId: ${order._id}. Skipping this order.`);
        continue;
      }

      let orderId: Types.ObjectId;
      try {
        orderId = new Types.ObjectId(order._id);
        this.logger.log(`Order ID casted successfully: ${orderId}`);
      } catch (castError) {
        this.logger.error(`Failed to cast _id to ObjectId: ${order._id}. Error: ${castError.message}`);
        continue;
      }

      try {
        this.logger.log('Creating Stripe Checkout session with a 3% discount...');
        
        // Define success and cancel URLs for the Stripe checkout session
        const successUrl = `https://yourdomain.com/success`;  // Adjust with your actual success URL
        const cancelUrl = `https://yourdomain.com/cancel`;    // Adjust with your actual cancel URL

        // Generate Stripe Checkout session with 3% discount
        const createOrderDto = { ...order.toObject(), products: order.products }; // Convert the order to DTO
        const discount = 3; // Apply a 3% discount
        const session = await this.stripeService.createCheckoutSession(createOrderDto, successUrl, cancelUrl, true, discount); // Pass exists=true and 3% discount

        // Send the reminder email with the checkout session URL and mention the discount
        this.logger.log('Sending reminder email with a 3% discount...');
        await this.mailService.sendMail(
          order.email,
          'Payment Reminder - Special Discount!',
          `Dear ${order.first_name}, please complete your payment and enjoy a 3% discount.`,
          `<p>Dear <strong>${order.first_name}</strong>,<br>We noticed your order is still pending payment. Please complete your payment <a href="${session.url}">here</a> and enjoy an exclusive 3% discount.</p>`
        );

        // Mark that the reminder has been sent
        this.logger.log('Marking reminder as sent...');
        await this.orderService.markReminderSent(orderId);
      } catch (error) {
        this.logger.error(`Failed to process reminder for order ${order._id}: ${error.message}`);
      }
    }
  }
}