import e, { NextFunction, Request, Response } from "express";
import { EditVendorInput, LoginVendorInput } from "../dto";
import { Vendor } from "../models";
import { generateToken, validatePassword } from "../utils";

export const loginVendor = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = <LoginVendorInput>req.body;

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
    const { name, address, phone, foodType } = <EditVendorInput>req.body;

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

export const updateVendorService = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { isAvailable } = req.body;

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
