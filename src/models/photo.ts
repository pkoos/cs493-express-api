import { Model } from './model-interface';

import {Request, Response } from 'express';
import { Pool, ResultSetHeader, OkPacket } from 'mysql2/promise';
import * as rh from '../controllers/responses-helper';

export class Photo extends Model<Photo> {
    businessId: number = -1;
    fileName: string = "";
    caption: string = "";

    public constructor(init?: Partial<Photo>) {
        super(init);
        Object.assign(this, init);
    }

    isValid(): boolean {
        const valid: boolean =
            this.id != undefined && this.id != -1 &&
            this.ownerId != undefined && this.ownerId != -1 &&
            this.businessId != undefined && this.businessId > 0 &&
            this.fileName != undefined && this.fileName != "";
            return valid;
    }

    newQueryParams(): any[] {
        return [ this.ownerId, this.businessId, this.fileName, this.caption ];
    }

    modifyQueryParams(): any[] {
        return [ this.caption, this.id ]
    }

    generateList(data: OkPacket[]): Photo[] {
        const return_value: Photo[] = [];
        data.forEach( (row) => {
            // const dbp: Photo = photoFromDb(row);
            const dbp: Photo = this.fromDatabase(row);
            return_value.push(dbp);
        });
    return return_value;
    }

    fromDatabase(row: OkPacket): Photo {
        const dbp: Photo = super.fromDatabase(row);
        console.log(`photo from db: ${JSON.stringify(dbp)}`);
        return super.fromDatabase(row);
    }
}

export async function addPhoto(db: Pool, req: Request, res: Response) {    
    const new_photo: Photo = new Photo({
        id: -20,
        ownerId: req.body["ownerId"],
        businessId: req.body['businessId'],
        fileName: req.body['fileName'],
        caption: req.body['caption']
    });

    if(!new_photo.isValid()) { // either invalid values in request body, or missing fields from request body
        rh.errorInvalidBody(res);
        return;
    }
    const queryString:string = `INSERT INTO photo (owner_id, business_id, file_name, caption) 
                                VALUES(?, ?, ?, ?)`;
    const [db_results] = await db.query(queryString, new_photo.newQueryParams());
    new_photo.id = (db_results as ResultSetHeader).insertId;
    rh.successResponse(res, {"photo": new_photo});
}

export async function modifyPhoto(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM photo WHERE id=?";
    const params: any[] = [parseInt(req.params.id)];
    const [results] = await db.query(queryString, params);
    const found_photo: Photo = photoFromDb((results as OkPacket[])[0]);
    if(!found_photo) {
        rh.errorNotFound(res, "Photo");
        return;
    }

    const owner_id = req.body['ownerId'];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(found_photo.ownerId != owner_id) {
        rh.errorNoModify(res, "Photo");
        return;
    }

    const modified_photo: Photo = new Photo({
        id: found_photo.id,
        ownerId: found_photo.ownerId,
        businessId: found_photo.businessId,
        fileName: found_photo.fileName,
        caption: req.body['caption'] ?? found_photo.caption
    });

    if(!isValidPhoto(modified_photo)) {
        rh.errorInvalidModification(res, "Business");
        return;
    }

    const modifyQueryString: string = "UPDATE photo SET caption=? WHERE id=?";
    const modifyParams: any[] = modifyPhotoQueryParams(modified_photo);
    await db.query(modifyQueryString, modifyParams);

    rh.successResponse(res, {"business": modified_photo});
}

export async function removePhoto(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM photo WHERE id=?";
    const params: any[] = [parseInt(req.params.id)];
    const [results] = await db.query(queryString, params);
    const found_photo: Photo = photoFromDb((results as OkPacket[])[0]);

    if(!found_photo) {
        rh.errorNotFound(res, "Photo");
        return;
    }

    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(owner_id != found_photo.ownerId) {
        rh.errorNoRemove(res, "Photo");
        return;
    }

    const deleteQueryString:string = "DELETE FROM photo WHERE id=?";
    const deleteQueryParams:any[] = [found_photo.id];

    await db.query(deleteQueryString, deleteQueryParams);
    rh.successResponse(res, {"message": "Removed Photo", "photo": found_photo});
}

export async function getPhotos(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM photo WHERE owner_id=?";
    const params: any[] = [];
    if(!req.query.ownerId) {
        rh.errorInvalidQuery(res);
        return;
    }

    params.push(parseInt(req.query.ownerId as string));
    let [db_results] = await db.query(queryString, params);
    // let db_photos: Photo[] = generateListofPhotos(db_results as OkPacket[]);
    let db_photos: Photo[] = new Photo().generateList(db_results as OkPacket[]);

    rh.successResponse(res, {"ownerId": req.query.ownerId, "photos": db_photos});
}

export function isValidPhoto(photo: Photo): boolean {
    const valid: boolean = 
        photo.id != undefined && photo.id != 0 && 
        photo.ownerId != undefined && photo.ownerId != 0 && 
        photo.businessId != undefined && photo.businessId != 0 &&
        photo.fileName != undefined && photo.fileName != "";

    return valid;
}

export function photoFromDb(row: OkPacket): Photo {
    const rowMap: Map<string, string> = new Map(Object.entries(row));
    const new_photo: Photo = new Photo({
        id: parseInt(String(rowMap.get('id'))),
        ownerId: parseInt(String(rowMap.get('owner_id'))),
        businessId: parseInt(String(rowMap.get('business_id'))),
        fileName: String(rowMap.get('file_name')),
        caption: String(rowMap.get('caption'))
    });
    return new_photo
}

export function newPhotoQueryParams(photo: Photo): any[] {
    return [ photo.ownerId, photo.businessId, photo.fileName, photo.caption ]
}

export function modifyPhotoQueryParams(photo: Photo): any[] {
    return [ photo.caption, photo.id ];
}

export function generateListofPhotos(data: OkPacket[]): Photo[] {
    const return_value: Photo[] = [];
    data.forEach( (row) => {
        const dbp: Photo = photoFromDb(row);
        return_value.push(dbp);
    });
    return return_value;
}
