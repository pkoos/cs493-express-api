import {OkPacket} from 'mysql2/promise';
import { DatabaseModel } from './database_model';

export class Image extends DatabaseModel<Image> {
    id: number = -1;
    owner_id: number = -1;
    filename: string = "";
    path?: string = "";
    image_data?: Buffer;
    image_content_type: string = "";
    thumbnail_content_type: string = "";
    thumbnail_data?: Buffer;

    table_name: string = 'image';

    public constructor(data?: Partial<Image>) {
        super();
        Object.assign(this, data);
    }

    isValid(): boolean {
        const valid: boolean = 
            this.owner_id != undefined && this.owner_id != -1 &&
            this.filename != undefined && this.filename != "" &&
            this.image_content_type != undefined &&
            this.image_data != undefined;
            this.path != undefined && this.path != "";

        return valid;
    }

    fromDatabase(row: any[]): Image {
        const db_image: any = row[0];
        
        this.id = db_image.id;
        this.owner_id = db_image.owner_id;
        this.filename = db_image.filename;
        this.image_content_type = db_image.image_content_type;
        this.path = db_image.path;
        this.image_data = db_image.image_data;
        this.thumbnail_data = db_image.thumbnail_data;
        this.thumbnail_content_type = db_image.thumbnail_content_type;
        
        return this;
    }

    static deleteString(): string {
        return "DELETE FROM image WHERE id=?";
    }

    deleteParams(): any[] {
        return [this.id];
    }

    insertString(): string {
        return `(image_content_type, path, filename, owner_id, image_data) VALUES (?, ?, ?, ?, ?)`;
    }

    updateString(): string {
        return `
            owner_id=?, filename=?, path=?, image_content_type=?, 
            image_data=?, thumbnail_content_type=?, thumbnail_data=?
        `;
    }
    static insertString(): string {
        return `INSERT INTO image (image_content_type, path, filename, owner_id, image_data)
            VALUES(?, ?, ?, ?, ?)`;
    }

    insertParams(): any[] {
        return [this.image_content_type, this.path, this.filename, this.owner_id, this.image_data];
    }

    static modifyString(): string {
        return "";
    }

    modifyParams(): any[] {
        return [];
    }

    static generateList(data: OkPacket[]): Image[] {
        const return_value: Image[] = [];
        return return_value;
    }

    updateParams(): any[] {
        return [this.owner_id, this.filename, this.path, this.image_content_type, this.image_data, this.thumbnail_content_type, this.thumbnail_data, this.id];
    }
}