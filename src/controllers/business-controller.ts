import { Request, Response } from 'express';
import { Pool, ResultSetHeader, OkPacket } from 'mysql2/promise';

import * as rh from './responses-helper';
import { Business } from '../models/business';
import { Photo, generateListofPhotos } from '../models/photo';
import { Review } from '../models/review';

export async function addNewBusiness(db: Pool, req: Request, res: Response) {    
    const new_business: Business = new Business({
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
    });

    if(!new_business.isValid()) { // either invalid values in request body, or missing fields from request body
        rh.errorInvalidBody(res);
        return;
    }

    const db_results = await db.query(Business.insertString(), new_business.insertParams());
    new_business.id = (db_results[0] as ResultSetHeader).insertId;
    rh.successResponse(res, {"business": new_business});
}

export async function modifyBusiness(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM business WHERE id=?";
    const params: any[] = [parseInt(req.params.id)];
    const [results] = await db.query(queryString, params);
    if((results as OkPacket[]).length < 1) {
        rh.errorNotFound(res, "Business");
        return;
    }
    const found_business: Business = Business.fromDatabase((results as OkPacket[])[0]);
    if(!found_business) {
        rh.errorNotFound(res, "Business");
        return;
    }

    const owner_id = req.body['ownerId'];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(found_business.ownerId != owner_id) {
        rh.errorNoModify(res, "Business");
        return;
    }

    const modified_business: Business = new Business({
        id: found_business.id,
        ownerId: found_business.ownerId,
        name: req.body['name'] ? req.body['name'] : found_business.name,
        address: req.body['address'] ? req.body['address'] : found_business.address,
        city: req.body['city'] ? req.body['city'] : found_business.city,
        state: req.body['state'] ? req.body['state'] : found_business.state,
        zip: req.body['zip'] ? req.body['zip'] : found_business.zip,
        phone: req.body['phone'] ? req.body['phone'] : found_business.phone,
        category: req.body['category'] ? req.body['category'] : found_business.category,
        subcategory: req.body['subcategory'] ? req.body['subcategory'] : found_business.subcategory,
        website: req.body['website'] ? req.body['website'] : found_business.website,
        email: req.body['email'] ? req.body['email'] : found_business.email
    });

    if(!modified_business.isValid()) {
        rh.errorInvalidModification(res, "Business");
        return;
    }

    await db.query(Business.modifyString(), modified_business.modifyParams());

    rh.successResponse(res, {"business": modified_business});
}

export async function removeBusiness(db: Pool, req: Request, res: Response) {
    
    const ownerId:number = req.body['ownerId'];
    if(!ownerId) {
        rh.errorInvalidBody(res);
        return;
    }

    const queryString:string = "SELECT * FROM business WHERE id=?";
    const params: any[] = [parseInt(req.params.id)];
    const [results] = await db.query(queryString, params);
    if((results as OkPacket[]).length < 1) {
        rh.errorNotFound(res, "Business");
        return;
    }

    const found_business: Business = Business.fromDatabase((results as OkPacket[])[0]);

    if(!found_business) {
        rh.errorNotFound(res, "Business");
        return;
    }

    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(owner_id != found_business.ownerId) {
        rh.errorNoRemove(res, "Business");
        return;
    }

    await db.query(Business.deleteString(), found_business.deleteParams());
    rh.successResponse(res, {"message": "Removed Business", "business": found_business});
}

export async function getBusinesses(db: Pool, req: Request, res: Response) {
    let queryString:string = "SELECT * FROM business";
    const params:any[] = [];
    if(req.query.ownerId) {
        queryString = queryString.concat(" WHERE owner_id=?");
        params.push(parseInt(String(req.query.ownerId)));
    }

    let db_results = await db.query(queryString, params);
    let db_businesses: Business[] = Business.generateList((db_results[0] as OkPacket[]));

    rh.successResponse(res, {"businesses": db_businesses});
}

export async function getBusinessDetails(db: Pool, req: Request, res: Response) {
    const businessQueryString: string = "SELECT * FROM business WHERE id=?";
    const businessParams: any[] = [ parseInt(req.params.id) ];
    const [ businessResults ] = await db.query(businessQueryString, businessParams);
    if((businessResults as OkPacket[]).length < 1) {
        rh.errorNotFound(res, "Business");
        return;
    }

    const found_business: Business = Business.fromDatabase((businessResults as OkPacket[])[0]);

    let business_reviews: Review[] = [];
    const reviewQueryString: string = "SELECT * FROM review WHERE business_id=?";
    const reviewParams: any[] = [ found_business.id ];
    const [ reviewResults ] = await db.query(reviewQueryString, reviewParams);
    if((reviewResults as OkPacket[]).length > 0) {
        business_reviews = Review.generateList(reviewResults as OkPacket[]);
    }

    let business_photos: Photo[] = [];
    const photoQueryString: string = "SELECT * FROM photo where business_id=?";
    const photoParams: any[] = [ found_business.id ];
    const [ photoResults ] = await db.query(photoQueryString, photoParams);
    if((photoResults as OkPacket[]).length > 0) {
        business_photos = generateListofPhotos(photoResults as OkPacket[]);
    }

    const details_response = {
        "business": found_business,
        "photos": business_photos,
        "reviews": business_reviews
    }
    rh.successResponse(res, details_response);
}
