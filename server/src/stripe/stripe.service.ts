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

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
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

  // Create Stripe Checkout Session
  async createCheckoutSession(
    createOrderDto: CreateOrderDto,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    const lineItems = await Promise.all(
      createOrderDto.products.map(async (item) => {
        const product = await this.orderService.getProductById(item.product);
        if (!product) {
          throw new BadRequestException(
            `Product with ID ${item.product} not found`,
          );
        }

        const discount = product.discount || 0;
        const unit_price = product.price * ((100 - discount) / 100);

        return {
          price_data: {
            currency: 'bgn',
            product_data: {
              name: product.name,
              description: product.description,
              images: [
                'https://furniro-uploads-bucket.s3.eu-north-1.amazonaws.com/original/' +
                  product.cover_photo,
              ], // Adjust image URL
            },
            unit_amount: Math.round(unit_price * 100),
          },
          quantity: item.quantity,
        };
      }),
    );

    // Save order details (product IDs, quantities) in metadata
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: createOrderDto.email,
      metadata: {
        first_name: createOrderDto.first_name,
        last_name: createOrderDto.last_name,
        email: createOrderDto.email,
        products: JSON.stringify(createOrderDto.products), // Store products as JSON
      },
    });

    return session;
  }

  // Handle Stripe Webhook
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

      const products = JSON.parse(session.metadata.products); // Extract products from metadata

      const orderData: CreateOrderDto = {
        products: products,
        first_name: session.metadata.first_name,
        last_name: session.metadata.last_name,
        email: session.metadata.email,
        country: 'Bulgaria', // You can adjust these as necessary
        city: 'Sofia',
        address: '123 Main St',
        postal_code: '1000',
        phone_number: '+359888123456',
      };

      // Save the order after successful payment
      await this.orderService.createOrder(orderData);
    }
  }
}
