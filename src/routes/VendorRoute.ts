import express from "express";
import multer from "multer";
import {
    createFood,
    createPromo,
    getCurrentOrders,
    getFoods,
    getOrderDetails,
    getPromos,
    getVendorProfile,
    loginVendor,
    processOrder,
    updatePromo,
    updateVendorCoverImage,
    updateVendorProfile,
    updateVendorService,
} from "../controllers";
import { authenticate } from "../middlewares/CommonAuth";
import path from "path";

const router = express.Router();

const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../images"));
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + "_" + file.originalname);
    },
});

const images = multer({ storage: imageStorage }).array("images", 10);

router.post("/login", loginVendor);

router.use(authenticate);
router.get("/profile", getVendorProfile);
router.patch("/profile", updateVendorProfile);
router.patch("/coverimage", images, updateVendorCoverImage);
router.patch("/service", updateVendorService);

// Food
router.post("/food", images, createFood);
router.get("/foods", getFoods);

// Order
router.get("/orders", getCurrentOrders);
router.get("/order/:id", getOrderDetails);
router.put("/order/:id/process", processOrder);

// Promo
router.post("/promo", createPromo);
router.get("/promos", getPromos);
router.put("/promo/:id", updatePromo);

export { router as VendorRoute };
