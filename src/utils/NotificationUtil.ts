// Email

// Notification

// OTP
export const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit
    let otp_expiry = new Date();
    otp_expiry.setTime(new Date().getTime() + 5 * 60 * 1000);

    return {
        otp,
        otp_expiry,
    };
};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);

    const message = await client.messages.create({
        body: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+84${toPhoneNumber}`,
    });

    return message;
};

// Payment notification or emails
