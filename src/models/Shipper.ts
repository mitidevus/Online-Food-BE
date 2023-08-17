import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderDoc } from "./Order";

interface ShipperDoc extends Document {
    email: string;
    password: string;
    salt: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    pinCode: string;
    verified: boolean;
    lat: number;
    lng: number;
    isAvailable: boolean;
}

const ShipperSchema: Schema = new Schema(
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
        pinCode: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            required: true,
        },
        lat: {
            type: Number,
        },
        lng: {
            type: Number,
        },
        isAvailable: {
            type: Boolean,
        },
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

const Shipper: Model<ShipperDoc> = mongoose.model<ShipperDoc>(
    "shipper",
    ShipperSchema
);

export { Shipper };
