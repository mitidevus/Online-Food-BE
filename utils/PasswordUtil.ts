import bcrypt from "bcrypt";

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
