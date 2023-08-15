import express, { Request, Response, NextFunction } from "express";
import {
    createFood,
    getFoods,
    getVendorProfile,
    loginVendor,
    updateVendorCoverImage,
    updateVendorProfile,
    updateVendorService,
} from "../controllers";
import { authenticate } from "../middlewares/CommonAuth";
import multer from "multer";

const router = express.Router();

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const images = multer({ storage: imageStorage }).array("images", 10);

router.post("/login", loginVendor);

router.use(authenticate);
router.get("/profile", getVendorProfile);
router.patch("/profile", updateVendorProfile);
router.patch("/coverimage", images, updateVendorCoverImage);
router.patch("/service", updateVendorService);

router.post("/food", images, createFood);
router.get("/foods", getFoods);

export { router as VendorRoute };
