export interface ReviewInterface {
    id: number;
    // ownerId: number;
    stars: number;
    dollars: number;
    reviewText: string;
}


export class Review {

    id: number = -1;
    businessId: number = -1;
    // ownerId: number = 0;
    stars: number = -1;
    dollars: number = -1;
    reviewText: string = "";

    public constructor(init?: Partial<ReviewInterface>) {
        Object.assign(this, init);
    }
}

export function isValidReview(review: Review): boolean {
    console.log(`isValidReview: id: ${review.id}, stars: ${review.stars}, dollars: ${review.dollars}, review: ${review.reviewText}`)
    const valid: boolean = 
        review.id != -1 && review.id != undefined &&
        review.businessId != -1 && review.businessId != undefined && 
        review.stars != undefined && review.stars > -1 && review.stars < 6 &&
        review.dollars != undefined && review.dollars > 0 && review.dollars < 5
    return valid;
}