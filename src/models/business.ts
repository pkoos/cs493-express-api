export class Business {

    private id: number;
    private ownerId: number;
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

    constructor(id: number, ownerId: number, name: string, address:string, city: string, state: string, zip: string, phone: string, category: string, subcategory: string, website?: string, email?: string) {
        this.id = id;
        this.ownerId = ownerId;
        this.name = name;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.phone = phone;
        this.category = category;
        this.subcategory = subcategory;
        this.website = website ?? "";
        this.email = email ?? "";
        
    }
}