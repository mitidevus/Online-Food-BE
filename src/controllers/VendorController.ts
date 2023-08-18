import { NextFunction, Request, Response } from "express";
import {
    CreatePromoInputs,
    LoginVendorInputs,
    UpdateVendorInputs,
} from "../dto";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Vendor } from "../models";
import { Food } from "../models/Food";
import { Order } from "../models/Order";
import { Promo } from "../models/Promo";
import { generateToken, validatePassword } from "../utils";
import path from "path";

export const loginVendor = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = <LoginVendorInputs>req.body;

    const existingVendor = await Vendor.findOne({ email });

    if (!existingVendor) {
        return res.status(404).json({
            message: "No vendor found with this email",
        });
    }

    const isPasswordValid = await validatePassword(
        password,
        existingVendor.salt,
        existingVendor.password
    );

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid password",
        });
    }

    const token = await generateToken({
        _id: existingVendor._id,
        email: existingVendor.email,
        name: existingVendor.name,
        foodType: existingVendor.foodType,
    });

    return res.status(200).json({
        token,
    });
};

export const getVendorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const vendor = await Vendor.findById(user._id);

    if (!vendor) {
        return res.status(404).json({
            message: "No vendor found",
        });
    }

    return res.status(200).json(vendor);
};

export const updateVendorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, address, phone, foodType } = <UpdateVendorInputs>req.body;

    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const vendor = await Vendor.findById(user._id);

    if (!vendor) {
        return res.status(404).json({
            message: "No vendor found",
        });
    }

    vendor.name = name;
    vendor.address = address;
    vendor.phone = phone;
    vendor.foodType = foodType;

    await vendor.save();

    return res.status(200).json(vendor);
};

export const updateVendorCoverImage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const vendor = await Vendor.findById(user._id);

    if (!vendor) {
        return res.status(404).json({
            message: "No vendor found",
        });
    }

    const files = req.files as [Express.Multer.File];

    const images = files.map((file: Express.Multer.File) => file.filename);

    vendor.coverImages.push(...images);

    const savedVendor = await vendor.save();

    return res.status(200).json(savedVendor);
};

export const updateVendorService = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const vendor = await Vendor.findById(user._id);

    if (!vendor) {
        return res.status(404).json({
            message: "No vendor found",
        });
    }

    vendor.serviceAvailable = !vendor.serviceAvailable;

    const { lat, lng } = req.body;

    if (lat && lng) {
        vendor.lat = lat;
        vendor.lng = lng;
    }

    const savedVendor = await vendor.save();

    return res.status(200).json(savedVendor);
};

export const createFood = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const { name, description, category, foodType, readyTime, price } = <
        CreateFoodInputs
    >req.body;

    const vendor = await Vendor.findById(user._id);

    if (!vendor) {
        return res.status(404).json({
            message: "No vendor found",
        });
    }

    const files = req.files as Express.Multer.File[];

    const images = files.map((file) => file.filename);

    const newFood = await Food.create({
        vendorId: vendor._id,
        name,
        description,
        category,
        foodType,
        readyTime,
        price,
        rating: 0,
        images,
    });

    vendor.foods.push(newFood);
    await vendor.save();

    return res.status(201).json(newFood);
};

export const getFoods = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const foods = await Food.find({ vendorId: user._id });

    if (!foods) {
        return res.status(404).json({
            message: "No foods found",
        });
    }

    return res.status(200).json(foods);
};

export const getCurrentOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const orders = await Order.find({ vendorId: user._id }).populate(
        "items.food"
    );

    if (!orders) {
        return res.status(404).json({
            message: "No orders found",
        });
    }

    return res.status(200).json(orders);
};

export const getOrderDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate("items.food");

    if (!order) {
        return res.status(404).json({
            message: "No order found",
        });
    }

    return res.status(200).json(order);
};

export const processOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            message: "No order found",
        });
    }

    const { status, notes, readyTime } = req.body; // Status: Accept, Reject, Ready, In Progress

    order.status = status;
    order.notes = notes;
    order.readyTime = readyTime;

    const savedOrder = await order.save();

    return res.status(200).json(savedOrder);
};

export const createPromo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const vendor = await Vendor.findById(user._id);

    if (!vendor) {
        return res.status(404).json({
            message: "No vendor found",
        });
    }

    const {
        promoType,
        promoRequire,
        promoCode,
        title,
        description,
        minValue,
        promoAmount,
        startDate,
        endDate,
        bank,
        bins,
        pinCode,
        isActive,
    } = <CreatePromoInputs>req.body;

    const newPromo = await Promo.create({
        promoType,
        promoRequire,
        promoCode,
        vendors: [vendor],
        title,
        description,
        minValue,
        promoAmount,
        startDate,
        endDate,
        bank,
        bins,
        pinCode,
        isActive,
    });

    return res.status(201).json(newPromo);
};

export const getPromos = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const promos = await Promo.find().populate("vendors");

    if (!promos) {
        return res.status(404).json({
            message: "No promos found",
        });
    }

    let currentPromos = [];

    promos.map((item) => {
        if (item.promoType === "GENERIC") {
            currentPromos.push(item);
        } else {
            if (item.vendors) {
                item.vendors.map((vendor) => {
                    if (vendor._id.toString() === user._id) {
                        currentPromos.push(item);
                    }
                });
            }
        }
    });

    return res.status(200).json(currentPromos);
};

export const updatePromo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const promoId = req.params.id;

    const promo = await Promo.findById(promoId);

    if (!promo) {
        return res.status(404).json({
            message: "No promo found",
        });
    }

    const {
        promoType,
        promoRequire,
        promoCode,
        title,
        description,
        minValue,
        promoAmount,
        startDate,
        endDate,
        bank,
        bins,
        pinCode,
        isActive,
    } = <CreatePromoInputs>req.body;

    promo.promoType = promoType;
    promo.promoRequire = promoRequire;
    promo.promoCode = promoCode;
    promo.title = title;
    promo.description = description;
    promo.minValue = minValue;
    promo.promoAmount = promoAmount;
    promo.startDate = startDate;
    promo.endDate = endDate;
    promo.bank = bank;
    promo.bins = bins;
    promo.pinCode = pinCode;
    promo.isActive = isActive;

    const updatedPromo = await promo.save();

    return res.status(200).json(updatedPromo);
};
