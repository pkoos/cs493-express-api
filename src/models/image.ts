import {OkPacket} from 'mysql2/promise';

export class Image {
    id: number = -1;
    owner_id: number = -1;
    content_type: string = "";
    path: string = "";
    image_data: Buffer;
    thumbnail_data = undefined;

    public constructor(init?: Partial<Image>) {
        Object.assign(this, init);
    }

    isValid(): boolean {
        const valid: boolean = 
            this.owner_id != undefined && this.owner_id != -1 &&
            this.content_type != undefined && this.content_type != "" &&
            this.image_data != undefined;
            this.path != undefined && this.path != "";

        return valid;
    }

    static fromDatabase(row: any[]): Image {
        const db_image: any = row[0];
        const image: Image = new Image({
            id: db_image.id,
            owner_id: db_image.owner_id,
            content_type: db_image.content_type,
            // path: db_image.path,
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
        return `INSERT INTO image (content_type, path, owner_id, image_data)
            VALUES(?, ?, ?, ?)`;
    }

    insertParams(): any[] {
        return [this.content_type, this.path, this.owner_id, this.image_data];
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