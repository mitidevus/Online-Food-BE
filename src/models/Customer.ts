import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderDoc } from "./Order";

interface CustomerDoc extends Document {
    email: string;
    password: string;
    salt: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    verified: boolean;
    otp: number;
    otp_expiry: Date;
    lat: number;
    lng: number;
    cart: [any];
    orders: [OrderDoc];
}

const CustomerSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        salt: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        address: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            required: true,
        },
        otp: {
            type: Number,
            required: true,
        },
        otp_expiry: {
            type: Date,
            required: true,
        },
        lat: {
            type: Number,
        },
        lng: {
            type: Number,
        },
        cart: [
            {
                food: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "food",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],
        orders: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "order",
            },
        ],
    },
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.password;
                delete ret.salt;
                delete ret.__v;
                delete ret.createdAt;
                delete ret.updatedAt;
            },
        },
        timestamps: true,
    }
);

const Customer: Model<CustomerDoc> = mongoose.model<CustomerDoc>(
    "customer",
    CustomerSchema
);

export { Customer };
