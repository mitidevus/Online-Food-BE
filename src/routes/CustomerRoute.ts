import express from "express";
import {
    addToCart,
    createOrder,
    deleteCart,
    getAvailablePromos,
    getCart,
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

// Cart
router.post("/cart", addToCart);
router.get("/cart", getCart);
router.delete("/cart", deleteCart);

// Order
router.post("/order", createOrder);
router.get("/orders", getOrders);
router.get("/order/:id", getOrderById);

// Find Promos
router.get("/promos/:pinCode", getAvailablePromos);

export { router as CustomerRoute };
