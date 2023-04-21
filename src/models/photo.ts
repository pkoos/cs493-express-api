export interface PhotoInterface {
    id: number;
    userId: number;
    image: any;
    caption: string;
}

export class Photo {
    id: number = 0;
    userId: number = 0;
    image: any;
    caption: string = "";

    public constructor(init?: Partial<Photo>) {
        Object.assign(this, init);
    }

}

export function isValidPhoto(photo: Photo): boolean {
    const valid: boolean = 
        photo.id != 0 && photo.id != undefined &&
        photo.userId != 0 && photo.userId != undefined &&
        photo.image != undefined &&
        photo.caption != "" && photo.caption != undefined;

    
    return valid;
}