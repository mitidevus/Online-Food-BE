import mongoose, { Schema, Document, Model } from "mongoose";

export interface OrderDoc extends Document {
    orderId: string;
    items: [any];
    total: number;
    orderDate: Date;
    paymentMethod: string;
    paymentResponse: string;
    status: string;
}

const OrderSchema: Schema = new Schema(
    {
        orderId: { type: String, required: true },
        items: [
            {
                food: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "food",
                },
                quantity: { type: Number, required: true },
            },
        ],
        total: { type: Number, required: true },
        orderDate: { type: Date },
        paymentMethod: { type: String },
        paymentResponse: { type: String },
        status: { type: String },
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
