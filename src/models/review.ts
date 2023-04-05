export class Review {
    private id: number;
    private ownerId: number;
    stars: number;
    dollars: number;
    review: string;

    constructor(id: number, ownerId: number, stars: number, dollars: number, review?: string) {
        this.id = id;
        this.ownerId = ownerId;
        this.stars = stars;
        this.dollars = dollars;
        this.review = review ?? "";
        
    }
}