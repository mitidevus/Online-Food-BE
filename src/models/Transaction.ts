import mongoose, { Schema, Document, Model } from "mongoose";

export interface TransactionDoc extends Document {
    customerId: string;
    vendorId: string;
    orderId: string;
    orderAmount: number;
    promoId: string;
    paymentMode: string;
    paymentResponse: string;
    status: string;
}

const TransactionSchema: Schema = new Schema(
    {
        customer: { type: String },
        vendorId: { type: String },
        orderId: { type: String },
        orderAmount: { type: Number },
        promoId: { type: String },
        paymentMode: { type: String },
        paymentResponse: { type: String },
        status: { type: String },
    },
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v;
            },
        },
        timestamps: true,
    }
);

const Transaction: Model<TransactionDoc> = mongoose.model<TransactionDoc>(
    "transaction",
    TransactionSchema
); // Use TransactionDoc for type safety

export { Transaction };
