import { Request, Response } from 'express';
import { OkPacket, Pool, ResultSetHeader } from 'mysql2/promise';
import * as rh from '../controllers/responses-helper';

export class Review {

    id: number = -1;
    businessId: number = -1;
    ownerId: number = -1;
    stars: number = -1;
    dollars: number = -1;
    reviewText: string = "";

    public constructor(init?: Partial<Review>) {
        Object.assign(this, init);
    }
}

export async function addNewReview(db: Pool, req: Request, res: Response) {    
    const new_review: Review = {
        id: -20,
        ownerId: req.body["ownerId"],
        businessId: req.body["businessId"],
        stars: req.body["stars"],
        dollars: req.body["dollars"],
        reviewText: req.body["reviewText"]
    };

    if(!isValidReview(new_review)) { // either invalid values in request body, or missing fields from request body
        rh.errorInvalidBody(res);
        return;
    }
    const queryString:string = `INSERT INTO business (owner_id, name, address, city, state, zip, phone, category, subcategory, website, email) 
                                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params:any[] = newReviewQueryParams(new_review);
    const db_results = await db.query(queryString, params);
    const new_id = (db_results[0] as ResultSetHeader).insertId;
    new_review.id = new_id;
    rh.successResponse(res, {"review": new_review});
}

export async function modifyReview(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM review WHERE id=?";
    const params: any[] = [parseInt(req.params.id)];
    const [results] = await db.query(queryString, params);
    const found_review: Review = reviewFromDb((results as OkPacket[])[0]);
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

    const modified_review: Review = {
        id: found_review.id,
        businessId: req.body['businessId'] ?? found_review.businessId,
        ownerId: found_review.ownerId,
        stars: req.body['stars'] ?? found_review.stars,
        dollars: req.body['dollars'] ?? found_review.dollars,
        reviewText: req.body['reviewText'] ?? found_review.reviewText
    };

    if(!isValidReview(modified_review)) {
        rh.errorInvalidModification(res, "Review");
        return;
    }

    const modifyQueryString: string = "UPDATE review SET business_id=?, stars=?, dollars=?, review_text=? WHERE id=?";
    const modifyParams: any[] = modifyReviewQueryParams(modified_review);
    await db.query(modifyQueryString, modifyParams);

    rh.successResponse(res, {"review": modified_review});
}

export async function removeReview(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM review WHERE id=?";
    const params: any[] = [parseInt(req.params.id)];
    const [results] = await db.query(queryString, params);
    const found_review: Review = reviewFromDb((results as OkPacket[])[0]);

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

    const deleteQueryString:string = "DELETE FROM review WHERE id=?";
    const deleteQueryParams:any[] = [found_review.id];

    await db.query(deleteQueryString, deleteQueryParams);
    rh.successResponse(res, {"message": "Removed Review", "review": found_review});
}

export function generateListofReviews(data: OkPacket[]): Review[] {
    const return_value: Review[] = [];
    data.forEach( (row) => {
        const dbr: Review = reviewFromDb(row);
        return_value.push(dbr);
    });

    return return_value;
}

export function reviewFromDb(row: OkPacket): Review {
    const rowMap: Map<string, string> = new Map(Object.entries(row));
    const new_review: Review = {
        id: parseInt((rowMap.get('id')) as string),
        businessId: parseInt(String(rowMap.get('id'))),
        ownerId: parseInt(String(rowMap.get('owner_id'))),
        stars: parseInt(String(rowMap.get('stars'))),
        dollars: parseInt(String(rowMap.get('dollars'))),
        reviewText: String(rowMap.get('id')),
    };
    return new_review;
}

export function isValidReview(review: Review): boolean {
    const valid: boolean = 
        // review.id != undefined && review.id != -1 && 
        review.businessId != undefined && review.businessId != -1 &&
        review.ownerId != undefined && review.ownerId != -1 &&
        review.stars != undefined && review.stars > -1 && review.stars < 6 &&
        review.dollars != undefined && review.dollars > 0 && review.dollars < 5
    return valid;
}

export function newReviewQueryParams(review: Review): any[] {
    return [ review.businessId, review.ownerId, review.stars, review.dollars, review.reviewText ];
}

export function modifyReviewQueryParams(review: Review): any[] {
    return [
        review.businessId, review.stars, review.dollars, review.reviewText, review.id
    ];
}