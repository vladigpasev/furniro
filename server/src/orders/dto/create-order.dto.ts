// src/orders/dto/create-order.dto.ts
import { IsString, IsNotEmpty, IsArray, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Array of products with quantity',
    example: [{ product: '64e73458dfb1a820b5b47e07', quantity: 2 }]
  })
  @IsArray()
  @IsNotEmpty()
  products: Array<{
    product: string;
    quantity: number;
  }>;

  @ApiProperty({ description: 'First name of the customer', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(256)
  first_name: string;

  @ApiProperty({ description: 'Last name of the customer', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(256)
  last_name: string;

  @ApiProperty({ description: 'Company name', example: 'Acme Corp', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(256)
  company_name?: string;

  @ApiProperty({ description: 'Country of the customer', example: 'Bulgaria' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(256)
  country: string;

  @ApiProperty({ description: 'City of the customer', example: 'Sofia' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(256)
  city: string;

  @ApiProperty({ description: 'Address of the customer', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(512)
  address: string;

  @ApiProperty({ description: 'Postal code', example: '1000' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{4}$/, { message: 'Postal code must be a 4-digit number for Bulgaria' })
  postal_code: string;

  @ApiProperty({ description: 'Phone number', example: '+359888123456' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[\d\s]{10,15}$/, { message: 'Invalid phone number format' })
  phone_number: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: 'Additional information', required: false, example: 'Leave at the front door' })
  @IsString()
  @IsOptional()
  @MaxLength(1024)
  additional_info?: string;
}