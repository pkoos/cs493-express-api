export interface ReviewInterface {
    id: number;
    ownerId: number;
    stars: number;
    dollars: number;
    reviewText: string;
}


export class Review {

    id: number = 0;
    ownerId: number = 0;
    stars: number = 0;
    dollars: number = 0;
    review: string = "";

    public constructor(init?: Partial<ReviewInterface>) {
        Object.assign(this, init);
    }
}

export function isValidReview(review: ReviewInterface): boolean {
    const valid: boolean = 
        review.id != 0 && review.id != undefined &&
        review.ownerId != 0 && review.ownerId != undefined &&
        review.stars != 0 && review.stars != undefined &&
        review.dollars != 0 && review.dollars != undefined &&
        review.reviewText != "" && review.reviewText != undefined;
    return valid;
}