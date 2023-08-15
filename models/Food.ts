import mongoose, { Schema, Document, Model } from "mongoose";

export interface FoodDoc extends Document {
    vendorId: string;
    name: string;
    description: string;
    category: string;
    foodType: string;
    readyTime: number;
    price: number;
    rating: number;
    images: [string];
}

const FoodSchema: Schema = new Schema(
    {
        vendorId: { type: mongoose.SchemaTypes.ObjectId, ref: "vendor" },
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String },
        foodType: { type: String, required: true },
        readyTime: { type: Number },
        price: { type: Number, required: true },
        rating: { type: Number },
        images: { type: [String] },
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

const Food: Model<FoodDoc> = mongoose.model<FoodDoc>("food", FoodSchema); // Use FoodDoc for type safety

export { Food };
