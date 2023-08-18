import { NextFunction, Request, Response } from "express";
import { Vendor } from "../models";
import { FoodDoc } from "../models/Food";
import { Promo } from "../models/Promo";

export const getFoodAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const pinCode = req.params.pinCode;

    const query = pinCode
        ? { serviceAvailable: true, pinCode }
        : { serviceAvailable: true };

    const vendors = await Vendor.find(query)
        .sort({ rating: -1 })
        .populate("foods"); // populate is used to get the foods of the vendor

    if (vendors.length === 0) {
        return res.status(404).json({
            message: "No restaurants found",
        });
    }

    let foodResult: any = [];

    vendors.map((vendor) => {
        foodResult.push(...vendor.foods);
    });

    return res.status(200).json(foodResult);
};

export const getTopRestaurants = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const pinCode = req.params.pinCode;

    const result = await Vendor.find({
        pinCode,
    })
        .sort({ rating: -1 })
        .limit(5);

    if (result.length === 0) {
        return res.status(404).json({
            message: "No restaurants found",
        });
    }

    return res.status(200).json(result);
};

export const getFoodsIn30Min = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const pinCode = req.params.pinCode;

    const result = await Vendor.find({
        pinCode,
        serviceAvailable: true,
    }).populate("foods");

    if (result.length === 0) {
        return res.status(404).json({
            message: "No restaurants found",
        });
    }

    let foodResult: any = [];

    result.map((vendor) => {
        const foods = vendor.foods as [FoodDoc];

        foodResult.push(...foods.filter((food) => food.readyTime <= 30));
    });

    return res.status(200).json(foodResult);
};

export const searchFoods = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const pinCode = req.params.pinCode;

    const result = await Vendor.find({
        pinCode,
    }).populate("foods");

    if (result.length === 0) {
        return res.status(404).json({
            message: "No restaurants found",
        });
    }

    let foodResult: any = [];

    result.map((vendor) => {
        foodResult.push(...vendor.foods);
    });

    return res.status(200).json(foodResult);
};

export const getRestaurantById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = req.params.id;

    const result = await Vendor.findById(id).populate("foods"); // populate is used to get the foods of the vendor

    if (!result) {
        return res.status(404).json({
            message: "No restaurant found",
        });
    }

    return res.status(200).json(result);
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
