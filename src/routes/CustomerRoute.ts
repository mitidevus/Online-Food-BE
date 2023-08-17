import express from "express";
import {
    createOrder,
    getCustomerProfile,
    getOrderById,
    getOrders,
    loginCustomer,
    requestOTP,
    signupCustomer,
    updateCustomerProfile,
    verifyCustomer,
} from "../controllers";
import { authenticate } from "../middlewares/CommonAuth";

const router = express.Router();

// Sign Up
router.post("/signup", signupCustomer);

// Login
router.post("/login", loginCustomer);

router.use(authenticate);

// Verify Customer Account
router.patch("/verify", verifyCustomer);

// OTP / Request OTP
router.get("/otp", requestOTP);

// Profile
router.get("/profile", getCustomerProfile);
router.patch("/profile", updateCustomerProfile);

// Order
router.post("/order", createOrder);
router.get("/orders", getOrders);
router.get("/order/:id", getOrderById);

export { router as CustomerRoute };
