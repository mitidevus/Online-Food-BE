import { NextFunction, Request, Response } from "express";
import { LoginVendorInputs, UpdateVendorInputs } from "../dto";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Vendor } from "../models";
import { Food } from "../models/Food";
import { generateToken, validatePassword } from "../utils";

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

    const files = req.files as Express.Multer.File[];

    const images = files.map((file) => file.filename);

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
