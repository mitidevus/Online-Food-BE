import bcrypt from "bcrypt";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config";
import { AuthPayload } from "../dto/Auth.dto";

export const generateSalt = async () => {
    return await bcrypt.genSalt(10);
};

export const hashPassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt);
};

export const validatePassword = async (
    password: string,
    salt: string,
    savedPassword: string
) => {
    const hashedPassword = await hashPassword(password, salt);
    return hashedPassword === savedPassword;
};

export const generateToken = async (payload: AuthPayload) => {
    const token = await jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "1d" });

    return token;
};

export const verifyToken = async (req: Request) => {
    const token = req.get("Authorization")?.split(" ")[1];

    if (!token) {
        return false;
    }

    const payload = (await jwt.verify(token, JWT_SECRET_KEY)) as AuthPayload;

    req.user = payload; // Set user (payload) to request object

    return true;
};
