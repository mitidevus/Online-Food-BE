import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "../dto/Auth.dto";
import { verifyToken } from "../utils";

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const validate = await verifyToken(req);

    if (!validate) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    next();
};
