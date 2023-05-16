import { OkPacket } from 'mysql2/promise';

export class Review {

    id: number = -1;
    businessId: number = -1;
    ownerId: number = -1;
    stars: number = -1;
    dollars: number = -1;
    text: string = "";

    public constructor(init?: Partial<Review>) {
        Object.assign(this, init);
    }

    isValid(): boolean {
        const valid: boolean = 
        this.businessId != undefined && this.businessId != -1 &&
        this.ownerId != undefined && this.ownerId != -1 &&
        this.stars != undefined && this.stars > -1 && this.stars < 6 &&
        this.dollars != undefined && this.dollars > 0 && this.dollars < 5
    return valid;
    }

    static fromDatabase(row: OkPacket): Review {
        const rowMap: Map<string, string> = new Map(Object.entries(row));
        
        return new Review({
            id: parseInt((rowMap.get('id')) as string),
            businessId: parseInt(String(rowMap.get('business_id'))),
            ownerId: parseInt(String(rowMap.get('owner_id'))),
            stars: parseInt(String(rowMap.get('stars'))),
            dollars: parseInt(String(rowMap.get('dollars'))),
            text: String(rowMap.get('text')),
        });
    }

    static deleteString(): string {
        return `DELETE FROM review 
                WHERE id=?`;
    }

    deleteParams(): any[] {
        return [
            this.id
        ];
    }

    static insertString(): string {
        return `INSERT INTO review (owner_id, business_id, stars, dollars, text) 
                VALUES(?, ?, ?, ?, ?)`;
    }
    
    insertParams(): any[] {
        return [
            this.ownerId, this.businessId, this.stars, this.dollars, 
            this.text 
        ];
    }

    static modifyString(): string {
        return `UPDATE review 
                SET business_id=?, stars=?, dollars=?, text=? 
                WHERE id=?`;
    }

    modifyParams() {
        return [
            this.businessId, this.stars, this.dollars, this.text, this.id
        ];
    }

    static generateList(data: OkPacket[]): Review[] {
        const return_value: Review[] = [];
        data.forEach( (row) => {
            const dbr: Review = Review.fromDatabase(row);
            return_value.push(dbr);
        });
    
        return return_value;
    }
}
