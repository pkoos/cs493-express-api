import {OkPacket} from 'mysql2/promise';

export class Image {
    id: number = -1;
    fileName: string = "";

    public constructor(init?: Partial<Image>) {
        Object.assign(this, init);
    }

    isValid(): boolean {
        return false;
    }

    static fromDatabase(row: OkPacket): Image {
        return new Image();
    }

    static deleteString(): string {
        return "";
    }

    deleteParams(): any[] {
        return [];
    }

    static insertString(): string {
        return "";
    }

    static insertParams(): any[] {
        return [];
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