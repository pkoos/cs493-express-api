import { isDataView } from "util/types";

export interface BusinessInterface {
    id: number;
    // ownerId: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    category: string;
    subcategory: string;
    website: string;
    email: string;
}

export class Business {

    id: number = 0;
    name: string = "";
    address: string = "";
    city: string = "";
    state: string = "";
    zip: string = "";
    phone: string = "";
    category: string = "";
    subcategory: string = "";
    website: string = "";
    email: string = "";

    public constructor(init?: Partial<Business>) {
        Object.assign(this, init);
    }
}

export function isValidBusiness(business: Business): boolean {
    const valid: boolean = 
        business.id != 0 && business.id != undefined &&
        business.name != "" && business.name != undefined &&
        business.address != "" && business.address != undefined &&
        business.city != "" && business.city != undefined &&
        business.state != "" && business.state != undefined &&
        business.zip != "" && business.zip != undefined &&
        business.phone != "" && business.phone != undefined &&
        business.category != "" && business.category != undefined &&
        business.subcategory != "" && business.subcategory != undefined;

    return valid;
}

export function findById(business: Business, id: number) {
    return business.id == id;
}
