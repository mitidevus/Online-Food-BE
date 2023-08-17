import { IsEmail, Length } from "class-validator";

export class CreateShipperInputs {
    @IsEmail()
    email: string;

    @Length(6, 20)
    password: string;

    @Length(7, 11)
    phone: string;

    @Length(1, 16)
    firstName: string;

    @Length(1, 16)
    lastName: string;

    @Length(6, 30)
    address: string;

    @Length(1, 6)
    pinCode: string;
}
