export interface PhotoInterface {
    id: number;
    ownerId: number;
    image: any;
    caption: string;
}

export class Photo {
    id: number = 0;
    ownerId: number = 0;
    image: any;
    caption: string = "";

    public constructor(init?: Partial<Photo>) {
        Object.assign(this, init);
    }

}

export function isValidPhoto(photo: Photo): boolean {
    const valid: boolean = 
        photo.id != 0 && photo.id != undefined &&
        photo.ownerId != 0 && photo.ownerId != undefined &&
        photo.image != undefined &&
        photo.caption != "" && photo.caption != undefined;

    
    return valid;
}