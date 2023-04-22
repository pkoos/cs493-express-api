export interface PhotoInterface {
    id: number;
    userId: number;
    businessId: number;
    fileName: any;
    caption: string;
}

export class Photo {
    id: number = 0;
    userId: number = 0;
    businessId: number = 0;
    fileName: string = "";
    caption: string = "";

    public constructor(init?: Partial<Photo>) {
        Object.assign(this, init);
    }

}

export function isValidPhoto(photo: Photo): boolean {
    const valid: boolean = 
        photo.id != undefined && photo.id != 0 && 
        photo.userId != undefined && photo.userId != 0 && 
        photo.businessId != undefined && photo.businessId != 0 &&
        photo.fileName != undefined && photo.fileName != "";

    return valid;
}