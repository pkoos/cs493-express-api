export class Photo {
    private id: number;
    private ownerId: number;
    image: any;
    caption: string;

    constructor(id: number, ownerId: number, image: any, caption: string) {
        this.id = id;
        this.ownerId = ownerId;
        this.image = image;
        this.caption = caption;
    }

}