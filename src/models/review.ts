export interface ReviewInterface {
    id: number;
    ownerId: number;
    stars: number;
    dollars: number;
    reviewText: string;
}


export class Review {

    id: number = -1;
    businessId: number = -1;
    ownerId: number = -1;
    stars: number = -1;
    dollars: number = -1;
    reviewText: string = "";

    public constructor(init?: Partial<ReviewInterface>) {
        Object.assign(this, init);
    }
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