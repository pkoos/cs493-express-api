import { Request, Response } from 'express';
import { Pool, ResultSetHeader, OkPacket } from 'mysql2/promise';

import * as rh from './responses-helper';
import { Photo } from '../models/photo';
import { getPageSize, validatePageSize } from '..';
import { validateHeaderName } from 'http';

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
    let queryString:string = "SELECT * FROM photo WHERE owner_id=?";
    const params: any[] = [];
    if(!req.query.ownerId) {
        rh.errorInvalidQuery(res);
        return;
    }

    params.push(parseInt(req.query.ownerId as string));

    const countString: string = "SELECT COUNT(*) AS count FROM photo WHERE owner_id=?";
    const [count_results] = await db.query(countString, params);
    const max_page: number = Math.ceil((count_results as any)[0].count / getPageSize());
    let page: number;
    // let page: number = req.query.page ? validatePageSize(parseInt(req.query.page as string), max_page): 1;
    if(req.query.page) {
        page = validatePageSize(parseInt(req.query.page as string), max_page);
    }
    else {
        page = 1;
    }
    queryString = queryString.concat(" LIMIT ? OFFSET ?");
    console.log(`validatePageSize: ${page}, query param: ${req.query.page}`)
    params.push(getPageSize());
    params.push(getPageSize() * (page - 1));

    console.log(`queryString: ${queryString} params: ${params}`)
    let [db_results] = await db.query(queryString, params);
    let db_photos: Photo[] = (db_results as OkPacket[]).length > getPageSize() ? Photo.generateList((db_results as OkPacket[]).slice(0, 5)) : Photo.generateList((db_results as OkPacket[]));
    
    rh.successResponse(res, {
        "current_page": page,
        "last_page": max_page,
        "page_size": getPageSize(),
        "ownerId": req.query.ownerId, 
        "photos": db_photos});
}
