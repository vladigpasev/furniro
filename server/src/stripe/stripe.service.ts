import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { OrderService } from '../orders/order.service';
import { ProductService } from '../products/product.service';
import { Types } from 'mongoose';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2024-06-20',
      },
    );
    this.webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
  }

  async createCheckoutSession(
    createOrderDto: CreateOrderDto,
    successUrl: string,
    cancelUrl: string,
    discount: number = 0,
    exists: boolean = false,
    existingOrderId?: string,
  ): Promise<Stripe.Checkout.Session> {
    const lineItems = await Promise.all(
      createOrderDto.products.map(async (item) => {
        const product = await this.productService.getProductById(item.product);
        if (!product) {
          throw new BadRequestException(
            `Product with ID ${item.product} not found`,
          );
        }

        const totalDiscount = product.discount + discount;
        const unit_price = product.price * ((100 - totalDiscount) / 100);

        return {
          price_data: {
            currency: 'bgn',
            product_data: {
              name: product.name,
              description: product.description,
              images: [product.cover_photo],
            },
            unit_amount: Math.round(unit_price * 100),
          },
          quantity: item.quantity,
        };
      }),
    );

    let orderId: string;
    if (exists && existingOrderId) {
      orderId = existingOrderId;
    } else {
      const savedOrder = await this.orderService.createOrder(createOrderDto);
      orderId = savedOrder._id.toString();
    }

    return this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: createOrderDto.email,
      metadata: { order_id: orderId },
    });
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata.order_id;

      if (Types.ObjectId.isValid(orderId)) {
        await this.orderService.updateOrderPaymentStatus(
          new Types.ObjectId(orderId),
          true,
        );
      } else {
        this.logger.error(`Invalid ObjectId: ${orderId}`);
        throw new BadRequestException('Invalid order ID format');
      }
    }
  }
}
