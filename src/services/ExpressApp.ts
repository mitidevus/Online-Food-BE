import express, { Application } from "express";
import path from "path";

import {
    AdminRoute,
    CustomerRoute,
    ShipperRoute,
    ShoppingRoute,
    VendorRoute,
} from "../routes";

export default async (app: Application) => {
    app.use(express.json()); // for parsing application/json
    app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

    const imagePath = path.join(__dirname, "../images");
    app.use("/images", express.static(imagePath));

    app.use("/admin", AdminRoute);
    app.use("/vendor", VendorRoute);
    app.use("/customer", CustomerRoute);
    app.use("/shipper", ShipperRoute);
    app.use("/shopping", ShoppingRoute);

    return app;
};
