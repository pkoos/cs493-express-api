export interface BusinessInterface {
    id: number;
    ownerId: number;
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
    ownerId: number = 0;
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
        business.id != undefined && business.id != 0 &&
        business.ownerId != undefined && business.ownerId != 0 &&
        business.name != undefined && business.name != "" && 
        business.address != undefined && business.address != "" && 
        business.city != undefined && business.city != "" && 
        business.state != undefined && business.state != "" && 
        business.zip != undefined && business.zip != "" && 
        business.phone != undefined && business.phone != "" && 
        business.category != undefined && business.category != "" && 
        business.subcategory != undefined && business.subcategory != "";

    return valid;
}

export function findById(business: Business, id: number) {
    return business.id == id;
}
