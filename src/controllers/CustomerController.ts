import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import {
    CreateCustomerInputs,
    LoginCustomerInputs,
    OrderInputs,
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
import { Food } from "../models/Food";
import { Order } from "../models/Order";
import { Promo } from "../models/Promo";

// SIGN UP
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
        orders: [],
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

// LOGIN
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

// VERIFY ACCOUNT CUSTOMER
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

// OTP / REQUEST OTP
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

// PROFILE
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

// CART
export const addToCart = async (
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

    const profile = await Customer.findById(customer._id).populate("cart.food");

    console.log(profile);

    if (!profile) {
        return res.status(404).json({
            message: "Customer not found",
        });
    }

    const { _id, quantity } = <OrderInputs>req.body;

    const food = await Food.findById(_id);

    if (!food) {
        return res.status(404).json({
            message: "Food not found",
        });
    }

    let cartItems = [];
    cartItems = profile.cart;

    const existingItem = cartItems.find((item) => item.food._id == _id);

    if (existingItem) {
        const index = cartItems.indexOf(existingItem);

        if (quantity > 0) {
            cartItems[index].quantity = quantity;
        } else {
            cartItems.splice(index, 1);
        }
    } else {
        cartItems.push({
            food,
            quantity,
        });
    }

    profile.cart = cartItems as any;

    const updatedProfile = await profile.save();

    return res.status(200).json(updatedProfile.cart);
};

export const getCart = async (
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

    const profile = await Customer.findById(customer._id).populate("cart.food");

    if (!profile) {
        return res.status(404).json({
            message: "Customer not found",
        });
    }

    return res.status(200).json(profile.cart);
};

export const deleteCart = async (
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

    console.log(profile);

    if (!profile) {
        return res.status(404).json({
            message: "Customer not found",
        });
    }

    profile.cart = [] as any;

    const updatedProfile = await profile.save();

    return res.status(200).json(updatedProfile.cart);
};

// ORDER
export const createOrder = async (
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

    // Get order items from request body
    const cart = <[OrderInputs]>req.body; // [{id: xx, quantity: xx}]

    let cartItem = [];

    let total = 0;

    let vendorId = "";

    // Calculate total price
    const foods = await Food.find()
        .where("_id")
        .in(cart.map((item) => item._id))
        .exec();

    foods.map((food) => {
        cart.map((item) => {
            // Food id is ObjectId, item._id is string
            if (item._id === food._id.toString()) {
                vendorId = food.vendorId;
                total += food.price * item.quantity;
                cartItem.push({
                    food,
                    quantity: item.quantity,
                });
            }
        });
    });

    // Create order
    const orderId = Math.floor(Math.random() * 899999 + 100000); // From 100000 to 999999

    const currentOrder = await Order.create({
        orderId,
        vendorId,
        items: cartItem,
        total,
        orderDate: new Date(),
        paymentMethod: "COD",
        paymentResponse: "",
        status: "Pending",
    });

    if (!currentOrder) {
        return res.status(500).json({
            message: "Create order failed. Please try again later.",
        });
    }

    // Add order to customer
    profile.cart = [] as any;
    profile.orders.push(currentOrder);
    await profile.save();

    return res.status(201).json(currentOrder);
};

export const getOrders = async (
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

    const profile = await Customer.findById(customer._id).populate("orders");

    if (!profile) {
        return res.status(404).json({
            message: "Customer not found",
        });
    }

    return res.status(200).json(profile.orders);
};

export const getOrderById = async (
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

    const { id } = req.params;

    const profile = await Customer.findById(customer._id).populate("orders");

    if (!profile) {
        return res.status(404).json({
            message: "Customer not found",
        });
    }

    const order = profile.orders.find((order) => order._id == id);

    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }

    return res.status(200).json(order);
};

export const getAvailablePromos = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const pinCode = req.params.pinCode;

    const promos = await Promo.find({
        pinCode,
        isActive: true,
    });

    if (!promos) {
        return res.status(404).json({
            message: "No promos found",
        });
    }

    return res.status(200).json(promos);
};
