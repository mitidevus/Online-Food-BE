import express from "express";
import {
    getFoodAvailability,
    getFoodsIn30Min,
    getRestaurantById,
    getTopRestaurants,
    searchFoods,
} from "../controllers";

const router = express.Router();

// Food Availability
router.get("/:pinCode", getFoodAvailability);

// Top Restaurants
router.get("/top-restaurants/:pinCode", getTopRestaurants);

// Food Available in 30 mins
router.get("/foods-in-30-mins/:pinCode", getFoodsIn30Min);

// Search Food
router.get("/search/:pinCode", searchFoods);

// Find Restaurant By ID
router.get("/restaurant/:id", getRestaurantById);

export { router as ShoppingRoute };
