import express, { Application } from "express";
import bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import path from "path";

import { AdminRoute, ShoppingRoute, VendorRoute } from "../routes";

export default async (app: Application) => {
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    app.use("/images", express.static(path.join(__dirname, "images")));

    app.use("/admin", AdminRoute);
    app.use("/vendor", VendorRoute);
    app.use("/shopping", ShoppingRoute);

    return app;
};
