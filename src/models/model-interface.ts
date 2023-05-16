import {Request, Response} from 'express';
import {Pool, ResultSetHeader, OkPacket} from 'mysql2/promise';
import * as rh from '../controllers/responses-helper';

export interface ModelInterface<T> {

    id: number;
    ownerId: number;

    isValid(): boolean;
    newQueryParams(model: T): any[];
    modifyQueryParams(model: T): any[];
    generateList(data: OkPacket[]): T[];
}

export abstract class Model<T> implements ModelInterface<T> {
    id: number = -1;
    ownerId: number = -1;

    constructor(init?: Partial<T>) {
        Object.assign(this, init);
    }

    isValid(): boolean {
        throw Error("Implement in Subclass");
    }
    
    fromDatabase(row: OkPacket): T {
        const rowMap: Map<string, string> = new Map(Object.entries(row));
        return <T>(rowMap);
    }

    newQueryParams(model: T): any[] {
        throw Error("Implement in Subclass");
    };

    modifyQueryParams(model: T): any[] {
        throw Error("Implement in Subclass");
    };

    generateList(data: OkPacket[]): T[] {
        throw Error("Implement in Subclass");
    };
}