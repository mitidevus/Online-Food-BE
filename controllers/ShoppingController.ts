import { NextFunction, Request, Response } from "express";
import { Vendor } from "../models";
import { FoodDoc } from "../models/Food";

export const getFoodAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const pinCode = req.params.pinCode;

    const result = await Vendor.find({
        pinCode,
        serviceAvailable: true,
    })
        .sort({ rating: -1 })
        .populate("foods"); // populate is used to get the foods of the vendor

    if (result.length === 0) {
        return res.status(404).json({
            message: "No restaurants found",
        });
    }

    return res.status(200).json(result);
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
