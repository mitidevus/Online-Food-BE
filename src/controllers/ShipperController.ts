import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import {
    LoginCustomerInputs,
    UpdateCustomerProfileInputs,
} from "../dto/Customer.dto";
import { CreateShipperInputs } from "../dto/Shipper";
import { Shipper } from "../models/Shipper";
import {
    generateSalt,
    generateToken,
    hashPassword,
    validatePassword,
} from "../utils";

// SIGN UP
export const signupShipper = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const shipperInputs = plainToClass(CreateShipperInputs, req.body);

    const inputErrors = await validate(shipperInputs, {
        validationError: { target: true },
    });

    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }

    const { email, phone, password, firstName, lastName, address, pinCode } =
        shipperInputs;

    const existingShipper = await Shipper.findOne({
        email,
    });

    if (existingShipper) {
        return res.status(409).json({
            message: "A shipper with this email already exists.",
        });
    }

    const salt = await generateSalt();
    const userPassword = await hashPassword(password, salt);

    const newShipper = await Shipper.create({
        email,
        password: userPassword,
        salt,
        firstName,
        lastName,
        address,
        phone,
        pinCode,
        verified: false,
        lat: 0,
        lng: 0,
        isAvailable: false,
    });

    if (!newShipper) {
        return res.status(500).json({
            message: "Signup failed. Please try again later.",
        });
    }

    // Generate access token
    const token = await generateToken({
        _id: newShipper._id,
        email: newShipper.email,
        verified: newShipper.verified,
    });

    // Send result to client
    return res.status(201).json({
        token,
        verified: newShipper.verified,
        email: newShipper.email,
    });
};

// LOGIN
export const loginShipper = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const loginInputs = plainToClass(LoginCustomerInputs, req.body);

    const inputErrors = await validate(loginInputs, {
        validationError: { target: false },
    });

    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }

    const { email, password } = loginInputs;

    const shipper = await Shipper.findOne({
        email,
    });

    if (!shipper) {
        return res.status(404).json({
            message: "This email is not registered",
        });
    }

    if (!shipper.verified) {
        return res.status(400).json({
            message: "Shipper not verified",
        });
    }

    const isValidated = await validatePassword(
        password,
        shipper.salt,
        shipper.password
    );

    if (!isValidated) {
        return res.status(400).json({
            message: "Invalid password",
        });
    }

    // Generate access token
    const token = await generateToken({
        _id: shipper._id,
        email: shipper.email,
        verified: shipper.verified,
    });

    return res.status(200).json({
        token,
        verified: shipper.verified,
        email: shipper.email,
    });
};

// PROFILE
export const getShipperProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const shipper = req.user;

    if (!shipper) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const profile = await Shipper.findById(shipper._id);

    if (!profile) {
        return res.status(404).json({
            message: "Shipper not found",
        });
    }

    return res.status(200).json(profile);
};

export const updateShipperProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const shipper = req.user;

    const profileInputs = plainToClass(UpdateCustomerProfileInputs, req.body);

    const inputErrors = await validate(profileInputs, {
        validationError: { target: false },
    });

    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }

    if (!shipper) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const profile = await Shipper.findById(shipper._id);

    if (!profile) {
        return res.status(404).json({
            message: "Shipper not found",
        });
    }

    const { firstName, lastName, address } = profileInputs;

    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.address = address;

    const updatedShipper = await profile.save();

    return res.status(200).json(updatedShipper);
};

export const updateDeliveryStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const shipper = req.user;

    if (!shipper) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const profile = await Shipper.findById(shipper._id);

    if (!profile) {
        return res.status(404).json({
            message: "Shipper not found",
        });
    }

    profile.isAvailable = !profile.isAvailable;

    const { lat, lng } = req.body;

    if (lat && lng) {
        profile.lat = lat;
        profile.lng = lng;
    }

    const updatedShipper = await profile.save();

    return res.status(200).json(updatedShipper);
};
