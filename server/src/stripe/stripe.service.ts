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
import { Types } from 'mongoose'; // Import Mongoose Types for ObjectId

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
    // Updated Create Stripe Checkout Session
    async createCheckoutSession(
        createOrderDto: CreateOrderDto,
        successUrl: string,
        cancelUrl: string,
        exists: boolean = false, // Add the exists parameter with a default value
        discount: number = 0, // New discount parameter
    ): Promise<Stripe.Checkout.Session> {
        const lineItems = await Promise.all(
            createOrderDto.products.map(async (item) => {
                // Convert product ID from string to ObjectId
                const productId = new Types.ObjectId(item.product);

                const product = await this.orderService.getProductById(productId);
                if (!product) {
                    throw new BadRequestException(
                        `Product with ID ${item.product} not found`,
                    );
                }

                // Apply the additional discount (if any)
                const productDiscount = product.discount || 0;
                const totalDiscount = productDiscount + discount; // Combine product discount and additional discount
                const unit_price = product.price * ((100 - totalDiscount) / 100);

                return {
                    price_data: {
                        currency: 'bgn',
                        product_data: {
                            name: product.name,
                            description: product.description,
                            images: [
                                'https://furniro-uploads-bucket.s3.eu-north-1.amazonaws.com/original/' +
                                product.cover_photo,
                            ],
                        },
                        unit_amount: Math.round(unit_price * 100), // Stripe expects the price in cents
                    },
                    quantity: item.quantity,
                };
            }),
        );

        let orderId: string;

        // Only create an order in the database if exists is false
        if (!exists) {
            // Create and save the order with payed = false
            const savedOrder = await this.orderService.createOrder(createOrderDto);
            orderId = savedOrder._id.toString();
        } else {
            // Use a dummy order ID or generate one if exists is true
            orderId = 'dummy_order_id';
        }

        // Create the Stripe Checkout session
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${successUrl}`,
            cancel_url: `${cancelUrl}`,
            customer_email: createOrderDto.email,
            metadata: {
                order_id: orderId, // Store the order ID in metadata
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
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException('Invalid webhook signature');
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata.order_id;

            // Convert orderId from string to ObjectId before updating order status
            const objectId = new Types.ObjectId(orderId);

            // Update the order's payed field to true
            await this.orderService.updateOrderPaymentStatus(objectId, true);
        }
    }
}  