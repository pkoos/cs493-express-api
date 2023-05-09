import { Request, Response } from 'express';
import { OkPacket, Pool, ResultSetHeader } from 'mysql2/promise';
import * as rh from '../controllers/responses-helper';

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

export function businessFromDb(row: OkPacket): Business {
    const rowMap: Map<string, string> = new Map(Object.entries(row));
    const new_business: Business = {
        id: parseInt(String(rowMap.get('id'))),
        ownerId: parseInt(String(rowMap.get('owner_id'))),
        name: String( rowMap.get('name')),
        address: String( rowMap.get('address')),
        city: String( rowMap.get('city')),
        state: String( rowMap.get('state')),
        zip: String( rowMap.get('zip')),
        phone: String( rowMap.get('phone')),
        category: String( rowMap.get('category')),
        subcategory: String( rowMap.get('subcategory')),
        website: String( rowMap.get('website')),
        email: String( rowMap.get('email')),
    }
    console.log(`new business: ${JSON.stringify(new_business)}`);
    return new_business;
}

export async function generateBusinessesList(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM business";
    const params:any[] = [];
    if(req.query.ownerId) {
        queryString.concat(" WHERE id=?");
        params.push(parseInt(String(req.query.ownerId)));
    }

    let db_results = await db.query(queryString, params);
    let db_businesses: Business[] = generateBusinessesList2((db_results[0] as OkPacket[]));

    rh.successResponse(res, {"businesses": db_businesses});
}

export async function addNewBusiness(db: Pool, req: Request, res: Response) {
    // console.log(`Attempting to add a business: ${JSON.stringify(req.body)}`);
    
    const new_business: Business = {
        id: -20,
        ownerId: req.body["ownerId"],
        name: req.body["name"],
        address: req.body["address"],
        city: req.body["city"],
        state: req.body["state"],
        zip: req.body["zip"],
        phone: req.body["phone"],
        category: req.body["category"],
        subcategory: req.body["subcategory"],
        website: req.body["website"],
        email: req.body["email"]
    };

    if(!isValidBusiness(new_business)) { // either invalid values in request body, or missing fields from request body
        rh.errorInvalidBody(res);
        return;
    }
    const queryString:string = `INSERT INTO business (owner_id, name, address, city, state, zip, phone, category, subcategory, website, email) 
                                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params:any[] = businessQueryParams(new_business);
    const db_results = await db.query(queryString, params);
    const new_id = (db_results[0] as ResultSetHeader).insertId;
    new_business.id = new_id;
    rh.successResponse(res, {"business": new_business});
}

export function generateBusinessesList2(data: OkPacket[]): Business[] {
    const return_value: Business[] = []
        data.forEach( (row) => { 
            const dbb: Business = businessFromDb(row);
            return_value.push(dbb);
        });
        console.log(return_value);
    return return_value;
}

export function businessQueryParams(bus: Business): any[] {
    return [
        bus.ownerId, bus.name, bus.address, bus.city, bus.state, bus.zip,
        bus.phone, bus.category, bus.subcategory, bus.website, bus.email
    ];
}

export function isValidBusiness(business: Business): boolean {
    const valid: boolean = 
        // business.id != undefined && business.id != 0 &&
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
