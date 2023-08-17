import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import {
    CartItem,
    CreateCustomerInputs,
    LoginCustomerInputs,
    OrderInputs,
    PaymentCustomerInputs,
    UpdateCustomerProfileInputs,
} from "../dto/Customer.dto";
import { Vendor } from "../models";
import { Customer } from "../models/Customer";
import { Food } from "../models/Food";
import { Promo } from "../models/Promo";
import { Shipper } from "../models/Shipper";
import { Transaction } from "../models/Transaction";
import {
    generateOTP,
    generateSalt,
    generateToken,
    hashPassword,
    onRequestOTP,
    validatePassword,
} from "../utils";
import { Order } from "../models/Order";

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

    const existingCustomer = await Customer.findOne({
        email,
    });

    if (existingCustomer) {
        return res.status(409).json({
            message: "A customer with this email already exists.",
        });
    }

    const salt = await generateSalt();
    const userPassword = await hashPassword(password, salt);

    const { otp, otp_expiry } = generateOTP();

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
            message: "This email is not registered",
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

    const { _id, quantity } = <CartItem>req.body;

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

// TRANSACTION
export const createTransaction = async (
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

    const { totalAmount, paymentMethod, promoId } = <PaymentCustomerInputs>(
        req.body
    );

    let finalAmount = totalAmount;

    if (promoId) {
        const promo = await Promo.findById(promoId);

        if (!promo) {
            return res.status(404).json({
                message: "Promo not found",
            });
        }

        if (!promo.isActive) {
            return res.status(400).json({
                message: "Promo is not active",
            });
        }

        finalAmount = totalAmount - promo.promoAmount;
    }

    // Create record on Transaction
    const transaction = await Transaction.create({
        customerId: customer._id,
        vendorId: "",
        orderId: "",
        orderAmount: finalAmount,
        promoId: promoId || "N/A",
        paymentMode: paymentMethod,
        paymentResponse: "Cash payment on delivery",
        status: "Open",
    });

    if (!transaction) {
        return res.status(500).json({
            message: "Create transaction failed. Please try again later.",
        });
    }

    return res.status(201).json(transaction);
};

const validateTransaction = async (transactionId: string) => {
    const currentTransaction = await Transaction.findById(transactionId);

    if (!currentTransaction || currentTransaction.status !== "Open") {
        return {
            status: false,
            currentTransaction,
        };
    }

    return {
        status: true,
        currentTransaction,
    };
};

// DELIVERY NOTIFICATION
const findShipperNearVendor = async (vendorId: string) => {
    // Find the vendor
    const vendor = await Vendor.findById(vendorId);

    if (vendor) {
        const pinCode = vendor.pinCode;
        const vendorLat = vendor.lat;
        const vendorLng = vendor.lng;

        // Find the delivery person
        const shippers = await Shipper.find({
            verified: true,
            isAvailable: true,
            pinCode,
        });

        if (shippers.length > 0) {
            // Find the nearest shipper
            let minDistance;
            let shipper = shippers[0];

            shippers.map((shipper) => {
                const shipperLat = shipper.lat;
                const shipperLng = shipper.lng;

                const distance = Math.sqrt(
                    Math.pow(shipperLat - vendorLat, 2) +
                        Math.pow(shipperLng - vendorLng, 2)
                );

                if (!minDistance || distance < minDistance) {
                    minDistance = distance;
                    shipper = shipper;
                }
            });

            return shipper._id;
        }
    }

    return null;
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

    // Validate transaction
    const { transactionId, finalAmount, items } = <OrderInputs>req.body;

    const { status, currentTransaction } = await validateTransaction(
        transactionId
    );

    if (!status) {
        return res.status(400).json({
            message: "Invalid transaction",
        });
    }

    let cartItem = [];

    let totalAmount = 0;

    let vendorId = "";

    // Calculate totalAmount price
    const foods = await Food.find()
        .where("_id")
        .in(items.map((item) => item._id))
        .exec();

    foods.map((food) => {
        items.map((item) => {
            // Food id is ObjectId, item._id is string
            if (item._id === food._id.toString()) {
                vendorId = food.vendorId;
                totalAmount += food.price * item.quantity;
                cartItem.push({
                    food,
                    quantity: item.quantity,
                });
            }
        });
    });

    // Create order
    const orderId = `${Math.floor(Math.random() * 899999 + 100000)}`; // From 100000 to 999999, string

    const currentOrder = {
        orderId,
        vendorId,
        items: cartItem,
        totalAmount,
        finalAmount,
        orderDate: new Date(),
        status: "Pending",
        notes: "",
        deliveryId: "",
        readyTime: 45,
    };

    // Assign order for delivery
    const deliveryId = await findShipperNearVendor(vendorId.toString());

    if (!deliveryId) {
        return res.status(500).json({
            message: "Assign order for shipper failed. Please try again later.",
        });
    }

    currentOrder.deliveryId = deliveryId;
    const order = await Order.create(currentOrder);

    // Update transaction
    currentTransaction.vendorId = vendorId;
    currentTransaction.orderId = order._id;
    currentTransaction.status = "Success";

    await currentTransaction.save();

    // Add order to customer
    profile.cart = [] as any;
    profile.orders.push(order);

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

export const verifyPromo = async (
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

    const promoId = req.params.id;

    const promo = await Promo.findById(promoId);

    if (!promo) {
        return res.status(404).json({
            message: "Promo not found",
        });
    }

    if (!promo.isActive) {
        return res.status(400).json({
            message: "Promo is not active",
        });
    }

    return res.status(200).json({ message: "Promo is valid.", promo });
};
