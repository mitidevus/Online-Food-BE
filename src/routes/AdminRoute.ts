import express from "express";
import {
    createVendor,
    getShippers,
    getTransactionById,
    getTransactions,
    getVendorById,
    getVendors,
    verifyShipper,
} from "../controllers";

const router = express.Router();

// Vendor
router.post("/vendor", createVendor);

router.get("/vendors", getVendors);

router.get("/vendor/:id", getVendorById);

// Shipper
router.put("/shipper/verify", verifyShipper);
router.get("/shippers", getShippers);

// Transaction
router.get("/transactions", getTransactions);

router.get("/transaction/:id", getTransactionById);

export { router as AdminRoute };
