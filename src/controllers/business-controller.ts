import { Request, Response } from 'express';
import { Pool, ResultSetHeader, OkPacket } from 'mysql2/promise';
import { getPageSize, validatePageSize, db } from '../index';

import * as rh from './responses-helper';
import { Business } from '../models/business';
import { Photo } from '../models/photo';
import { Review } from '../models/review';

export async function addNewBusiness(req: Request, res: Response) {    
    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(owner_id !== req.loggedInID) {
        rh.errorNoModify(res, "Review");
        return;
    }

    const new_business: Business = new Business({
        id: -20,
        ownerId: owner_id,
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

export async function modifyBusiness(req: Request, res: Response) {
    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(owner_id !== req.loggedInID) {
        rh.errorNoModify(res, "Review");
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

export async function removeBusiness(req: Request, res: Response) {
    
    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(owner_id !== req.loggedInID) {
        rh.errorNoModify(res, "Review");
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

    if(owner_id != found_business.ownerId) {
        rh.errorNoRemove(res, "Business");
        return;
    }

    await db.query(Business.deleteString(), found_business.deleteParams());
    rh.successResponse(res, {"message": "Removed Business", "business": found_business});
}

export async function getBusinesses(req: Request, res: Response) {
    let queryString:string = "SELECT * FROM business";
    let countString: string = "SELECT COUNT(*) AS count FROM business";
    const params:any[] = [];
    const count_params:any[] = [];

    

    if(req.query.ownerId) {
        queryString = queryString.concat(" WHERE owner_id=?");
        countString = countString.concat(" WHERE owner_id=?");
        params.push(parseInt(req.query.ownerId as string));
        count_params.push(parseInt(req.query.ownerId as string));
    }

    const [count_results] = await db.query(countString, count_params);
    const max_page: number = Math.ceil( (count_results as any)[0].count / getPageSize());
    const page: number = req.query.page ? validatePageSize(parseInt(req.query.page as string), max_page) : 1;

    queryString = queryString.concat(" LIMIT ? OFFSET ?");
    params.push(getPageSize()); // method from index file
    params.push(getPageSize() * (page - 1)); // offset
    let [db_results] = await db.query(queryString, params);
    let db_businesses: Business[] = [];
    if((db_results as OkPacket[]).length > getPageSize()) {
        db_businesses = Business.generateList((db_results as OkPacket[]).slice(0, 5));
    }
    else {
        db_businesses = Business.generateList((db_results as OkPacket[]));
    }

    rh.successResponse(res, {
        "current_page": page,
        "last_page": max_page,
        "page_size": getPageSize(),
        "businesses": db_businesses
    });
}

export async function getBusinessDetails(req: Request, res: Response) {
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
        business_photos = Photo.generateList(photoResults as OkPacket[]);
    }

    const details_response = {
        "business": found_business,
        "photos": business_photos,
        "reviews": business_reviews
    }
    rh.successResponse(res, details_response);
}
