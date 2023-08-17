export interface CreateVendorInputs {
    name: string;
    ownerName: string;
    foodType: [string];
    pinCode: string;
    address: string;
    phone: string;
    email: string;
    password: string;
}

export interface LoginVendorInputs {
    email: string;
    password: string;
}

export interface UpdateVendorInputs {
    name: string;
    address: string;
    phone: string;
    foodType: [string];
}

export interface VendorPayload {
    _id: string;
    email: string;
    name: string;
    foodType: [string];
}

export interface CreatePromoInputs {
    promoType: string; // GENERIC, VENDOR
    promoRequire: string; // BANK, CARD, NONE
    promoCode: string;
    title: string;
    description: string;
    minValue: number;
    promoAmount: number;
    startDate: Date;
    endDate: Date;
    bank: [any];
    bins: [any];
    pinCode: string;
    isActive: boolean;
}
