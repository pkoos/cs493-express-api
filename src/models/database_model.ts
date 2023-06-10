import { ResultSetHeader } from 'mysql2/promise';
import {db} from '../index';

export abstract class DatabaseModel<T> {
    abstract id: number;

    abstract table_name: string;

    abstract isValid(): boolean;
    async update(): Promise<void> {
        const updateQueryString:string = `UPDATE ${this.table_name} SET ${this.updateString()} WHERE id=?`;
        db.query(updateQueryString, this.updateParams());
    }

    async insert(): Promise<number> {
        const [db_results] = await db.query(`INSERT INTO ${this.table_name} ${this.insertString()}`, this.insertParams());
        return (db_results as ResultSetHeader).insertId;
    }
    
    async find(id: number): Promise<T> {
        const [db_results] = await db.query(`SELECT * FROM ${this.table_name} WHERE id=?`, [id]);
        return this.fromDatabase(db_results as any[]);
    }
    async search(queryString: string, params: any[]): Promise<T> {
        const [db_results] = await db.query(`SELECT * FROM ${this.table_name} WHERE ${queryString}`, params);
        return this.fromDatabase(db_results as any[]);
    }

    abstract fromDatabase(data: any[]): T;
    abstract updateParams(): any[];
    abstract insertParams(): any[];
    abstract insertString(): string;
    abstract updateString(): string;
}