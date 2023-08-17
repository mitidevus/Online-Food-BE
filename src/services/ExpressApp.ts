import express, { Application } from "express";
import mongoose, { ConnectOptions } from "mongoose";
import path from "path";

import {
    AdminRoute,
    CustomerRoute,
    ShoppingRoute,
    VendorRoute,
} from "../routes";

export default async (app: Application) => {
    app.use(express.json()); // for parsing application/json
    app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

    app.use("/images", express.static(path.join(__dirname, "images")));

    app.use("/admin", AdminRoute);
    app.use("/vendor", VendorRoute);
    app.use("/customer", CustomerRoute);
    app.use(ShoppingRoute);

    return app;
};
