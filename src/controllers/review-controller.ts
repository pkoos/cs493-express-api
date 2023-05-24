import { Request, Response } from 'express';
import { Pool, ResultSetHeader, OkPacket } from 'mysql2/promise';

import * as rh from './responses-helper';

import { Review } from '../models/review';
import { getPageSize, validatePageSize } from '../index';

export async function addReview(db: Pool, req: Request, res: Response) {    
    const prevQueryString:string = "SELECT * FROM review WHERE owner_id=? AND business_id=?";
    const prevParams:any[] = [ req.body['ownerId'], req.body['businessId'] ];
    const [ prevResults ] = await db.query(prevQueryString, prevParams);
    if((prevResults as OkPacket[]).length > 0) {
        rh.genericErrorResponse(res, 403, "A user can only leave one Review per Business.");
        return;
    }

    const new_review: Review = new Review({
        id: -20,
        ownerId: req.body["ownerId"],
        businessId: req.body["businessId"],
        stars: req.body["stars"],
        dollars: req.body["dollars"],
        text: req.body["text"]
    });

    if(!new_review.isValid()) { // either invalid values in request body, or missing fields from request body
        rh.errorInvalidBody(res);
        return;
    }

    const [db_results] = await db.query(Review.insertString(), new_review.insertParams());
    new_review.id = (db_results as ResultSetHeader).insertId;
    rh.successResponse(res, {"review": new_review});
}

export async function modifyReview(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM review WHERE id=?";
    const params: any[] = [parseInt(req.params.id)];
    const [results] = await db.query(queryString, params);
    if((results as OkPacket[]).length < 1) {
        rh.errorNotFound(res, "Review");
        return;
    }
    const found_review: Review = Review.fromDatabase((results as OkPacket[])[0]);
    if(!found_review) {
        rh.errorNotFound(res, "Review");
        return;
    }

    const owner_id = req.body['ownerId'];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(found_review.ownerId != owner_id) {
        rh.errorNoModify(res, "Review");
        return;
    }

    const modified_review: Review = new Review({
        id: found_review.id,
        businessId: req.body['businessId'] ?? found_review.businessId,
        ownerId: found_review.ownerId,
        stars: req.body['stars'] ?? found_review.stars,
        dollars: req.body['dollars'] ?? found_review.dollars,
        text: req.body['text'] ?? found_review.text
    });

    if(!modified_review.isValid()) {
        rh.errorInvalidModification(res, "Review");
        return;
    }

    await db.query(Review.modifyString(), modified_review.modifyParams());

    rh.successResponse(res, {"review": modified_review});
}

export async function removeReview(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM review WHERE id=?";
    const params: any[] = [parseInt(req.params.id)];
    const [results] = await db.query(queryString, params);

    if((results as OkPacket[]).length < 1) {
        rh.errorNotFound(res, "Review");
        return;
    }
    const found_review: Review = Review.fromDatabase((results as OkPacket[])[0]);

    if(!found_review) {
        rh.errorNotFound(res, "Review");
        return;
    }

    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(owner_id != found_review.ownerId) {
        rh.errorNoRemove(res, "Review");
        return;
    }

    await db.query(Review.deleteString(), found_review.deleteParams());
    rh.successResponse(res, {"message": "Removed Review", "review": found_review});
}

export async function getReviews(db: Pool, req: Request, res: Response) {
    let queryString:string = "SELECT * FROM review WHERE owner_id=?";
    const params: any[] = [];
    if(!req.query.ownerId) {
        rh.errorInvalidQuery(res);
        return;
    }

    params.push(parseInt(req.query.ownerId as string));
    
    const countString: string = "SELECT COUNT(*) as count FROM review WHERE owner_id=?";
    const [count_results] = await db.query(countString, params);
    const max_page: number = Math.ceil((count_results as any)[0].count / getPageSize());
    let page: number;
    if(req.query.page) {
        page = validatePageSize(parseInt(req.query.page as string), max_page);
    }
    else {
        page = 1;
    }
    queryString = queryString.concat(" LIMIT ? OFFSET ?");
    params.push(getPageSize());
    params.push(getPageSize() * (page - 1));
    let [db_results] = await db.query(queryString, params);
    let db_reviews: Review[] = Review.generateList(db_results as OkPacket[]);

    rh.successResponse(res, {
        "current_page": page,
        "last_page": max_page,
        "page_size": getPageSize(),
        "ownerId": req.query.ownerId, "reviews": db_reviews});
}
