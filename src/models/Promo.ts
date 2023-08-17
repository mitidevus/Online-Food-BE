import mongoose, { Schema, Document, Model } from "mongoose";

export interface PromoDoc extends Document {
    promoType: string; // GENERIC, VENDOR
    promoRequire: string; // BANK, CARD, NONE
    promoCode: string;
    vendors: [any];
    title: string;
    description: string;
    promoAmount: number;
    minValue: number;
    startDate: Date;
    endDate: Date;
    bank: [any];
    bins: [any];
    pinCode: string;
    isActive: boolean;
}

const PromoSchema: Schema = new Schema(
    {
        promoType: { type: String, required: true },
        promoRequire: { type: String, required: true },
        promoCode: { type: String, required: true },
        vendors: [{ type: mongoose.SchemaTypes.ObjectId, ref: "vendor" }],
        title: { type: String, required: true },
        description: { type: String, required: true },
        promoAmount: { type: Number, required: true },
        minValue: { type: Number, required: true },
        startDate: { type: Date },
        endDate: { type: Date },
        bank: [{ type: String }],
        bins: [{ type: Number }],
        pinCode: { type: String, required: true },
        isActive: { type: Boolean, required: true },
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

const Promo: Model<PromoDoc> = mongoose.model<PromoDoc>("promo", PromoSchema); // Use PromoDoc for type safety

export { Promo };
