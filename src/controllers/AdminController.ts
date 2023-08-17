import { NextFunction, Request, Response } from "express";
import { CreateVendorInputs } from "../dto";
import { Vendor } from "../models";
import { Shipper } from "../models/Shipper";
import { Transaction } from "../models/Transaction";
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
    } = <CreateVendorInputs>req.body;

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
        foods: [],
        lat: 0,
        lng: 0,
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

export const getTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const transactions = await Transaction.find();

    if (!transactions) {
        return res.status(404).json({
            message: "No transactions found",
        });
    }

    return res.status(200).json(transactions);
};

export const getTransactionById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
        return res.status(404).json({
            message: "No transaction found",
        });
    }

    return res.status(200).json(transaction);
};

export const verifyShipper = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { _id, status } = req.body;

    const shipper = await Shipper.findById(_id);

    if (!shipper) {
        return res.status(404).json({
            message: "No shipper found",
        });
    }

    shipper.verified = status;

    const updatedShipper = await shipper.save();

    return res.status(200).json(updatedShipper);
};

export const getShippers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const shippers = await Shipper.find();

    if (!shippers) {
        return res.status(404).json({
            message: "No shippers found",
        });
    }

    return res.status(200).json(shippers);
};
