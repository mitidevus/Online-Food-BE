import mongoose, { Schema, Document, Model } from "mongoose";

export interface OrderDoc extends Document {
    orderId: string;
    vendorId: string;
    items: [any];
    totalAmount: number;
    finalAmount: number;
    orderDate: Date;
    status: string;
    notes: string;
    deliveryId: string;
    readyTime: number; // Max 60 minutes
}

const OrderSchema: Schema = new Schema(
    {
        orderId: { type: String, required: true },
        vendorId: { type: String, required: true },
        items: [
            {
                food: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "food",
                    required: true,
                },
                quantity: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        finalAmount: { type: Number, required: true },
        orderDate: { type: Date },
        status: { type: String },
        notes: { type: String },
        deliveryId: { type: String },
        readyTime: { type: Number },
    },
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v;
                delete ret.createdAt;
                delete ret.updatedAt;
            },
        },
        timestamps: true,
    }
);

const Order: Model<OrderDoc> = mongoose.model<OrderDoc>("order", OrderSchema);

export { Order };
