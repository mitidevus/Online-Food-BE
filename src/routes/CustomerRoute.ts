import express from "express";
import {
    addToCart,
    createOrder,
    createTransaction,
    deleteCart,
    getCart,
    getCustomerProfile,
    getOrderById,
    getOrders,
    loginCustomer,
    requestOTP,
    signupCustomer,
    updateCustomerProfile,
    verifyCustomer,
    verifyPromo,
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

// Transaction (Payment )
router.post("/transaction", createTransaction);

// Order
router.post("/order", createOrder);
router.get("/orders", getOrders);
router.get("/order/:id", getOrderById);

// Promo
router.get("/promo/verify/:id", verifyPromo);

export { router as CustomerRoute };
