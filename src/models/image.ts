import {OkPacket} from 'mysql2/promise';

export class Image {
    id: number = -1;
    owner_id: number = -1;
    filename: string = "";
    image_content_type: string = "";
    path?: string = "";
    image_data?: Buffer;
    thumbnail_data = undefined;

    public constructor(init?: Partial<Image>) {
        Object.assign(this, init);
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

    static fromDatabase(row: any[]): Image {
        const db_image: any = row[0];
        const image: Image = new Image({
            id: db_image.id,
            owner_id: db_image.owner_id,
            filename: db_image.filename,
            image_content_type: db_image.image_content_type,
            path: db_image.path,
            image_data: db_image.image_data,
            thumbnail_data: db_image.thumbnail_data
        });

        return image;
    }

    static deleteString(): string {
        return "DELETE FROM image WHERE id=?";
    }

    deleteParams(): any[] {
        return [this.id];
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
}