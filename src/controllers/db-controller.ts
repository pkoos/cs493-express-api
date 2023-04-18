import { Database } from 'sqlite3';

const _initDatabaseString = "CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR(50) NOT NULL UNIQUE, business_owner NUMERIC NOT NULL, hash VARCHAR(128) NOT NULL);";

export class DbController {
    private _db:Database = new Database('db.sqlite');
    
    constructor() {
        this.initializeDatabase();
    }

    private initializeDatabase() {
        this._db.exec(_initDatabaseString);
    }

    public execute(query:string, args:[]) {
        // this._db.exec(query, args);
    }
 }