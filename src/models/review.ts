import { Request, Response } from 'express';
import { OkPacket, Pool } from 'mysql2/promise';
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
        review.id != undefined && review.id != -1 && 
        review.businessId != undefined && review.businessId != -1 &&
        review.ownerId != undefined && review.ownerId != -1 &&
        review.stars != undefined && review.stars > -1 && review.stars < 6 &&
        review.dollars != undefined && review.dollars > 0 && review.dollars < 5
    return valid;
}