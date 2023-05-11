import {Request, Response } from 'express';
import { Pool, ResultSetHeader, OkPacket } from 'mysql2/promise';
import * as rh from '../controllers/responses-helper';

export class Photo {
    id: number = 0;
    ownerId: number = 0;
    businessId: number = 0;
    fileName: string = "";
    caption: string = "";

    public constructor(init?: Partial<Photo>) {
        Object.assign(this, init);
    }

}

export async function addPhoto(db: Pool, req: Request, res: Response) {    
    const new_photo: Photo = {
        id: -20,
        ownerId: req.body["ownerId"],
        businessId: req.body['businessId'],
        fileName: req.body['fileName'],
        caption: req.body['caption']
    };

    if(!isValidPhoto(new_photo)) { // either invalid values in request body, or missing fields from request body
        rh.errorInvalidBody(res);
        return;
    }
    const queryString:string = `INSERT INTO photo (owner_id, business_id, file_name, caption) 
                                VALUES(?, ?, ?, ?)`;
    const params:any[] = newPhotoQueryParams(new_photo);
    const db_results = await db.query(queryString, params);
    const new_id = (db_results[0] as ResultSetHeader).insertId;
    new_photo.id = new_id;
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

    const modified_photo: Photo = {
        id: found_photo.id,
        ownerId: found_photo.ownerId,
        businessId: found_photo.businessId,
        fileName: found_photo.fileName,
        caption: req.body['caption'] ?? found_photo.caption
    };

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
    const new_photo: Photo = {
        id: parseInt(String(rowMap.get('id'))),
        ownerId: parseInt(String(rowMap.get('owner_id'))),
        businessId: parseInt(String(rowMap.get('business_id'))),
        fileName: String(rowMap.get('file_name')),
        caption: String(rowMap.get('caption'))
    }
    return new_photo
}

export function newPhotoQueryParams(photo: Photo): any[] {
    return [ photo.ownerId, photo.businessId, photo.fileName, photo.caption ]
}

export function modifyPhotoQueryParams(photo: Photo): any[] {
    return [ photo.caption, photo.id ];
}