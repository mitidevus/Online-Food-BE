import e, { NextFunction, Request, Response } from "express";
import { VendorLoginInput } from "../dto";
import { Vendor } from "../models";
import { validatePassword } from "../utils";

export const loginVendor = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = <VendorLoginInput>req.body;

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

    return res.status(200).json(existingVendor);
};

export const getVendorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {};

export const updateVendorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {};

export const updateVendorService = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {};
