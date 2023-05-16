import { Request, Response } from 'express';
import { Pool, ResultSetHeader, OkPacket } from 'mysql2/promise';

import * as rh from './responses-helper';
import { Photo } from '../models/photo';

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

    const [db_results] = await db.query(Photo.insertString(), new_photo.insertParams());
    new_photo.id = (db_results as ResultSetHeader).insertId;
    rh.successResponse(res, {"photo": new_photo});
}

export async function modifyPhoto(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM photo WHERE id=?";
    const params: any[] = [parseInt(req.params.id)];
    const [results] = await db.query(queryString, params);
    const found_photo: Photo = Photo.fromDatabase((results as OkPacket[])[0]);
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

    if(!modified_photo.isValid()) {
        rh.errorInvalidModification(res, "Business");
        return;
    }

    await db.query(Photo.modifyString(), modified_photo.modifyParams());
    rh.successResponse(res, {"business": modified_photo});
}

export async function removePhoto(db: Pool, req: Request, res: Response) {
    const queryString:string = "SELECT * FROM photo WHERE id=?";
    const params: any[] = [parseInt(req.params.id)];
    const [results] = await db.query(queryString, params);
    const found_photo: Photo = Photo.fromDatabase((results as OkPacket[])[0]);

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

    await db.query(Photo.deleteString(), found_photo.deleteParams());
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
    let db_photos: Photo[] = Photo.generateList(db_results as OkPacket[]);

    rh.successResponse(res, {"ownerId": req.query.ownerId, "photos": db_photos});
}

// export function isValidPhoto(photo: Photo): boolean {
//     const valid: boolean = 
//         photo.id != undefined && photo.id != 0 && 
//         photo.ownerId != undefined && photo.ownerId != 0 && 
//         photo.businessId != undefined && photo.businessId != 0 &&
//         photo.fileName != undefined && photo.fileName != "";

//     return valid;
// }

// export function photoFromDb(row: OkPacket): Photo {
//     const rowMap: Map<string, string> = new Map(Object.entries(row));
//     const new_photo: Photo = new Photo({
//         id: parseInt(String(rowMap.get('id'))),
//         ownerId: parseInt(String(rowMap.get('owner_id'))),
//         businessId: parseInt(String(rowMap.get('business_id'))),
//         fileName: String(rowMap.get('file_name')),
//         caption: String(rowMap.get('caption'))
//     });
//     return new_photo
// }

// export function newPhotoQueryParams(photo: Photo): any[] {
//     return [ photo.ownerId, photo.businessId, photo.fileName, photo.caption ]
// }

// export function modifyPhotoQueryParams(photo: Photo): any[] {
//     return [ photo.caption, photo.id ];
// }

// export function generateListofPhotos(data: OkPacket[]): Photo[] {
//     const return_value: Photo[] = [];
//     data.forEach( (row) => {
//         const dbp: Photo = photoFromDb(row);
//         return_value.push(dbp);
//     });
//     return return_value;
// }
