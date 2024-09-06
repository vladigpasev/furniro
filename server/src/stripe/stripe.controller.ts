import { Controller, Post, Body, Req, Res, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() createOrderDto: CreateOrderDto, @Res() res: Response) {
    const successUrl = this.configService.get<string>('FRONTEND_SUCCESS_URL');
    const cancelUrl = this.configService.get<string>('FRONTEND_CANCEL_URL');

    const session = await this.stripeService.createCheckoutSession(createOrderDto, successUrl, cancelUrl);
    res.json({ id: session.id, url: session.url });
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    const rawBody = req.body;

    try {
      await this.stripeService.handleWebhook(Buffer.from(rawBody), signature);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
}
