import { IsEmail, Length } from "class-validator";

export class CreateCustomerInputs {
    @IsEmail()
    email: string;

    @Length(6, 20)
    password: string;

    @Length(7, 11)
    phone: string;
}

export class LoginCustomerInputs {
    @IsEmail()
    email: string;

    @Length(6, 20)
    password: string;
}

export class UpdateCustomerProfileInputs {
    @Length(1, 16)
    firstName: string;

    @Length(1, 16)
    lastName: string;

    @Length(6, 30)
    address: string;
}

export interface CustomerPayload {
    _id: string;
    email: string;
    verified: boolean;
}

export class CartItem {
    _id: string;
    quantity: number;
}

export class OrderInputs {
    transactionId: string;
    finalAmount: number;
    items: [CartItem];
}

export interface PaymentCustomerInputs {
    totalAmount: number;
    paymentMethod: string;
    promoId: string;
}
