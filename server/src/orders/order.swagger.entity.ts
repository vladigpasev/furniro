import { ApiProperty } from '@nestjs/swagger';

export class OrderSwagger {
  @ApiProperty({
    description: 'Array of products with quantity and price',
    example: [
      { product: '64e73458dfb1a820b5b47e07', quantity: 2, unit_price: 49.99 },
    ],
  })
  products: Array<{
    product: string;
    quantity: number;
    unit_price: number;
  }>;

  @ApiProperty({ description: 'First name of the customer', example: 'John' })
  first_name: string;

  @ApiProperty({ description: 'Last name of the customer', example: 'Doe' })
  last_name: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corp',
    required: false,
  })
  company_name?: string;

  @ApiProperty({ description: 'Country of the customer', example: 'Bulgaria' })
  country: string;

  @ApiProperty({ description: 'City of the customer', example: 'Sofia' })
  city: string;

  @ApiProperty({
    description: 'Address of the customer',
    example: '123 Main St',
  })
  address: string;

  @ApiProperty({ description: 'Postal code', example: '1000' })
  postal_code: string;

  @ApiProperty({ description: 'Phone number', example: '+359888123456' })
  phone_number: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Additional information',
    example: 'Leave at the front door',
    required: false,
  })
  additional_info?: string;
}
