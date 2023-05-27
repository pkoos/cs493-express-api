import { OkPacket } from 'mysql2/promise';

export class Photo {
    id: number = -1;
    ownerId: number = -1;
    businessId: number = -1;
    fileName: string = "";
    caption: string = "";

    public constructor(init?: Partial<Photo>) {
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

    static fromDatabase(row: OkPacket): Photo {
        const rowMap: Map<string, string> = new Map(Object.entries(row));
        
        const new_photo: Photo = new Photo({
            id: parseInt(rowMap.get('id') as string),
            ownerId: parseInt(String(rowMap.get('owner_id'))),
            businessId: parseInt(rowMap.get('business_id') as string),
            fileName: String(rowMap.get('file_name')),
            caption: rowMap.get('caption') as string
        });

        return new_photo;
    }

    static deleteString(): string {
        return `DELETE FROM photo 
                WHERE id=?`;
    }

    deleteParams(): any[] {
        return [
            this.id
        ];
    }

    static insertString() {
        return `INSERT INTO photo (owner_id, business_id, file_name, caption) 
                VALUES(?, ?, ?, ?)`;
    }

    insertParams() {
        return [ 
            this.ownerId, this.businessId, this.fileName, this.caption 
        ];
    }

    static modifyString() {
        return `UPDATE photo 
                SET caption=? 
                WHERE id=?`;
    }

    modifyParams() {
        return [ 
            this.caption, this.id 
        ];
    }
    newQueryParams(): any[] {
        return [ this.ownerId, this.businessId, this.fileName, this.caption ];
    }

    modifyQueryParams(): any[] {
        return [ this.caption, this.id ]
    }

    static generateList(data: OkPacket[]): Photo[] {
        const return_value: Photo[] = [];
        data.forEach( (row) => {
            // const dbp: Photo = photoFromDb(row);
            const dbp: Photo = this.fromDatabase(row);
            return_value.push(dbp);
        });
    return return_value;
    }

}
