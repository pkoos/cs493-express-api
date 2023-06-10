import { Request, Response } from "express";
import * as rh from '../controllers/responses-helper';
import { Image } from "../models/image";
import { channel, connection, db } from "..";
import { ResultSetHeader } from "mysql2/promise";
import fs from 'fs';
import sizeOf from 'image-size';
import Jimp from "jimp";

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
        filename: req.file?.filename,
        image_content_type: req.file?.mimetype,
        path: req.file?.path,
        image_data:  fs.readFileSync(req.file?.path as fs.PathOrFileDescriptor)
    });

    if(!new_image.isValid()) {
        rh.errorInvalidBody(res);
        return
    }

    const [db_results] = await db.query(Image.insertString(), new_image.insertParams());
    new_image.id = (db_results as ResultSetHeader).insertId;
    delete new_image.path;
    delete new_image.image_data;

    const id_buffer: Buffer = Buffer.from(String(new_image.id));
    channel.sendToQueue('generateThumbnail', id_buffer);
    setTimeout(() => { connection.close(); }, 500);

    await generateThumbnail();
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

export async function saveImageInfo(image: Image): Promise<number> {
    const db_results = await db.query(Image.insertString(), image.insertParams());
    const new_image_id: number = (db_results as unknown as ResultSetHeader).insertId;
    return new_image_id;
}

export async function getImageInfoById(id: number): Promise<Image> {
    const queryString: string = "SELECT * FROM image WHERE id=?";
    const [db_results] = await db.query(queryString, [id]);
    
    return Image.fromDatabase((db_results as any[]));
}

async function generateThumbnail() {


    channel.consume('generateThumbnail', async (msg) => {
        const image_id = msg?.content.toString();
        const queryString: string = "SELECT * FROM image WHERE id=?";
        const params: any[] = [image_id];
        const [db_results] = await db.query(queryString, params);
        const found_image: Image = Image.fromDatabase(db_results as any[]);
        // const dimensions = await sizeOf(found_image.image_data as Buffer);
        const thumbnail = await Jimp.read(found_image.image_data as Buffer);
        thumbnail.resize(100, 100).quality(60);
        found_image.thumbnail_data = await thumbnail.getBufferAsync(found_image.image_content_type);
        found_image.thumbnail_content_type = found_image.image_content_type;
        found_image.update();
    });
}