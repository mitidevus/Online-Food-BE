import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import {
    CreateCustomerInputs,
    LoginCustomerInputs,
    UpdateCustomerProfileInputs,
} from "../dto/Customer.dto";
import { validate } from "class-validator";
import {
    generateOTP,
    generateSalt,
    generateToken,
    hashPassword,
    onRequestOTP,
    validatePassword,
} from "../utils";
import { Customer } from "../models/Customer";

export const signupCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const customerInputs = plainToClass(CreateCustomerInputs, req.body);

    const inputErrors = await validate(customerInputs, {
        validationError: { target: true },
    });

    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }

    const { email, phone, password } = customerInputs;

    const salt = await generateSalt();
    const userPassword = await hashPassword(password, salt);

    const { otp, otp_expiry } = generateOTP();

    const existingCustomer = await Customer.findOne({
        email,
    });

    if (existingCustomer) {
        return res.status(409).json({
            message: "A customer with this email already exists.",
        });
    }

    const newCustomer = await Customer.create({
        email,
        password: userPassword,
        salt,
        firstName: "",
        lastName: "",
        address: "",
        phone,
        verified: false,
        otp,
        otp_expiry,
        lat: 0,
        lng: 0,
    });

    if (!newCustomer) {
        return res.status(500).json({
            message: "Signup failed. Please try again later.",
        });
    }

    // Send OTP to customer
    await onRequestOTP(otp, phone);

    // Generate access token
    const token = await generateToken({
        _id: newCustomer._id,
        email: newCustomer.email,
        verified: newCustomer.verified,
    });

    // Send result to client
    return res.status(201).json({
        token,
        verified: newCustomer.verified,
        email: newCustomer.email,
    });
};

export const loginCustomer = async (
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

    const customer = await Customer.findOne({
        email,
    });

    if (!customer) {
        return res.status(404).json({
            message: "Customer not found",
        });
    }

    if (!customer.verified) {
        return res.status(400).json({
            message: "Customer not verified",
        });
    }

    const isValidated = await validatePassword(
        password,
        customer.salt,
        customer.password
    );

    if (!isValidated) {
        return res.status(400).json({
            message: "Invalid password",
        });
    }

    // Generate access token
    const token = await generateToken({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
    });

    return res.status(200).json({
        token,
        verified: customer.verified,
        email: customer.email,
    });
};

export const verifyCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { otp } = req.body;

    if (!otp) {
        return res.status(400).json({
            message: "OTP is required",
        });
    }

    const customer = req.user;

    if (!customer) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
        return res.status(404).json({
            message: "Customer not found",
        });
    }

    if (profile.verified) {
        return res.status(400).json({
            message: "Customer already verified",
        });
    }

    console.log(otp);
    console.log(profile);

    if (profile.otp !== otp) {
        return res.status(400).json({
            message: "Invalid OTP",
        });
    }

    if (profile.otp_expiry < new Date()) {
        return res.status(400).json({
            message: "OTP expired",
        });
    }

    profile.verified = true;

    const verifiedCustomer = await profile.save();

    // Generate access token
    const token = await generateToken({
        _id: verifiedCustomer._id,
        email: verifiedCustomer.email,
        verified: verifiedCustomer.verified,
    });

    return res.status(200).json({
        token,
        verified: verifiedCustomer.verified,
        email: verifiedCustomer.email,
    });
};

export const requestOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const customer = req.user;

    if (!customer) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
        return res.status(404).json({
            message: "Customer not found",
        });
    }

    if (profile.verified) {
        return res.status(400).json({
            message: "Customer already verified",
        });
    }

    const { otp, otp_expiry } = generateOTP();

    profile.otp = otp;

    profile.otp_expiry = otp_expiry;

    const updatedCustomer = await profile.save();

    // Send OTP to customer
    await onRequestOTP(otp, updatedCustomer.phone);

    return res.status(200).json({
        message: "OTP sent to your registered phone number.",
    });
};

export const getCustomerProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const customer = req.user;

    if (!customer) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
        return res.status(404).json({
            message: "Customer not found",
        });
    }

    return res.status(200).json(profile);
};

export const updateCustomerProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const customer = req.user;

    const profileInputs = plainToClass(UpdateCustomerProfileInputs, req.body);

    const inputErrors = await validate(profileInputs, {
        validationError: { target: false },
    });

    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }

    if (!customer) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
        return res.status(404).json({
            message: "Customer not found",
        });
    }

    const { firstName, lastName, address } = profileInputs;

    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.address = address;

    const updatedCustomer = await profile.save();

    return res.status(200).json(updatedCustomer);
};
