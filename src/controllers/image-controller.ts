import { Request, Response } from "express";
import * as rh from '../controllers/responses-helper';
import { Image } from "../models/image";
import { db } from "..";
import { ResultSetHeader } from "mysql2/promise";
import fs from 'fs';

export async function addNewImage(req: Request, res: Response) {
    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(owner_id != req.loggedInID) {
        rh.errorNoModify(res, "Image");
        return;
    }

    const new_image: Image = new Image({
        id: -20,
        owner_id: req.body["ownerId"],
        content_type: req.file?.mimetype,
        path: req.file?.path,
        image_data:  fs.readFileSync(req.file?.path as fs.PathOrFileDescriptor)
    });

    if(!new_image.isValid()) {
        rh.errorInvalidBody(res);
        return
    }

    const [db_results] = await db.query(Image.insertString(), new_image.insertParams());
    new_image.id = (db_results as ResultSetHeader).insertId;
    rh.successResponse(res, {"image": new_image});
}

export async function modifyImage(req: Request, res: Response) {

}

export async function removeImage(req: Request, res: Response) {

}

export async function getImages(req: Request, res: Response) {

}

export async function getImageDetails(req: Request, res: Response) {
    
}