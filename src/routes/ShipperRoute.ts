import express from "express";
import {
    getShipperProfile,
    loginShipper,
    signupShipper,
    updateDeliveryStatus,
    updateShipperProfile,
} from "../controllers";
import { authenticate } from "../middlewares/CommonAuth";

const router = express.Router();

// Sign Up
router.post("/signup", signupShipper);

// Login
router.post("/login", loginShipper);

// Authentication
router.use(authenticate);

// Change Service Status
router.put("/change-status", updateDeliveryStatus);

// Profile
router.get("/profile", getShipperProfile);
router.patch("/profile", updateShipperProfile);

export { router as ShipperRoute };
