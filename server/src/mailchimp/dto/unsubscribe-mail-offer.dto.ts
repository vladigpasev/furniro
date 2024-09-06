import { IsEmail, IsNotEmpty } from 'class-validator';

export class UnsubscribeMailOfferDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}