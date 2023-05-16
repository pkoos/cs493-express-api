import { OkPacket } from 'mysql2/promise';

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

    isValid(): boolean {
        const valid: boolean = 
            this.ownerId != undefined && this.ownerId != 0 &&
            this.name != undefined && this.name != "" && 
            this.address != undefined && this.address != "" && 
            this.city != undefined && this.city != "" && 
            this.state != undefined && this.state != "" && 
            this.zip != undefined && this.zip != "" && 
            this.phone != undefined && this.phone != "" && 
            this.category != undefined && this.category != "" && 
            this.subcategory != undefined && this.subcategory != "";
        return valid;
    }

    static fromDatabase(row: OkPacket): Business {
        const rowMap: Map<string, string> = new Map(Object.entries(row));
        
        const new_business: Business = new Business({
            id: parseInt(String(rowMap.get('id'))),
            ownerId: parseInt(String(rowMap.get('owner_id'))),
            name: String(rowMap.get('name')),
            address: String(rowMap.get('address')),
            city: String(rowMap.get('city')),
            state: String(rowMap.get('state')),
            zip: String(rowMap.get('zip')),
            phone: String(rowMap.get('phone')),
            category: String(rowMap.get('category')),
            subcategory: String(rowMap.get('subcategory')),
            website: String(rowMap.get('website')),
            email: String(rowMap.get('email')),
        });

        return new_business;
    }

    static deleteString(): string {
        return "DELETE FROM business WHERE id=?";
    }

    deleteParams(): any[] {
        return [
            this.id
        ]
    }

    static insertString(): string {
           return `INSERT INTO business (owner_id, name, address, city, state, zip, phone, category, subcategory, website, email) 
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    }

    insertParams(): any[] {
        return [
            this.ownerId, this.name, this.address, this.city, this.state, this.zip,
            this.phone, this.category, this.subcategory, this.website, this.email
        ];
    }

    static modifyString(): string {
        return "UPDATE business SET name=?, address=?, city=?, state=?, zip=?, phone=?, category=?, subcategory=?, website=?, email=? WHERE id=?";
    }

    modifyParams(): any[] {
        return [
            this.name, this.address, this.city, this.state, this.zip, this.phone, 
            this.category, this.subcategory, this.website, this.email, this.id
        ];
    }

    static generateList(data: OkPacket[]): Business[] {
        const return_value: Business[] = []
        data.forEach( (row) => { 
            const dbb: Business = Business.fromDatabase(row);
            return_value.push(dbb);
        });

        return return_value;
    }
}
