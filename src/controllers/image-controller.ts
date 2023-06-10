import { Request, Response } from "express";
import * as rh from '../controllers/responses-helper';
import { Image } from "../models/image";
import { channel, connection, db } from "..";
import { ResultSetHeader } from "mysql2/promise";
import fs from 'fs';
import Jimp from "jimp";
import { ConsumeMessage } from "amqplib";

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
        filename: req.file?.filename as string,
        image_content_type: req.file?.mimetype as string,
        path: req.file?.path,
        image_data:  fs.readFileSync(req.file?.path as fs.PathOrFileDescriptor)
    });
    if(!new_image.isValid()) {
        rh.errorInvalidBody(res);
        return
    }
    const new_id: number = await new_image.insert();
    new_image.id = new_id;
    delete new_image.path;
    delete new_image.image_data;

    const id_buffer: Buffer = Buffer.from(String(new_image.id));
    channel.sendToQueue('generateThumbnail', id_buffer);

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
    return new Image().find(id);
}

async function generateThumbnail() {
    var image_id: number;

    channel.consume('generateThumbnail', async (msg?) => {
        if(msg) {
            image_id = parseInt(msg?.content.toString() as string);
        }
        channel.ack(msg as ConsumeMessage);
        const found_image: Image = await new Image().find(image_id);
        const thumbnail = await Jimp.read(found_image.image_data as Buffer);
        thumbnail.resize(100, 100).quality(60);
        found_image.thumbnail_data = await thumbnail.getBufferAsync(found_image.image_content_type);
        found_image.thumbnail_content_type = found_image.image_content_type;
        found_image.update();
    });
}