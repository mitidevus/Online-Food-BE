import { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { generateSalt, hashPassword } from "../utils";

export const createVendor = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        name,
        ownerName,
        foodType,
        pinCode,
        address,
        phone,
        email,
        password,
    } = <CreateVendorInput>req.body;

    const existingVendor = await Vendor.findOne({ email });

    if (existingVendor) {
        return res.status(400).json({
            message: "A vendor with this email already exists",
        });
    }

    // Generate salt and hash password
    const salt = await generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const newVendor = await Vendor.create({
        name,
        ownerName,
        foodType,
        pinCode,
        address,
        phone,
        email,
        password: hashedPassword,
        salt,
        serviceAvailable: false,
        coverImages: [],
        rating: 0,
    });

    return res.status(201).json(newVendor);
};

export const getVendors = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const vendors = await Vendor.find();

    if (!vendors) {
        return res.status(404).json({
            message: "No vendors found",
        });
    }

    return res.status(200).json(vendors);
};

export const getVendorById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const vendorId = req.params.id;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        return res.status(404).json({
            message: "No vendor found",
        });
    }

    return res.status(200).json(vendor);
};
