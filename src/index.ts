import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import mysql2, { Pool } from 'mysql2/promise';
import { getBusinesses, addNewBusiness, modifyBusiness, removeBusiness, getBusinessDetails } from './controllers/business-controller';
import { addReview, modifyReview, removeReview, getReviews } from './models/review';
import { addPhoto, getPhotos, modifyPhoto, removePhoto } from './models/photo';

const app: Express = express();
const port = process.env.PORT ?? 3000;
const db:Pool = mysql2.createPool({
    connectionLimit: 10,
    user: "busi-user",
    password: "asdfqwer1234",
    database: "busirate",
    host: "localhost", // use the container name
    // host: "db", // use the container name
    port: 3306
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const baseApiPath: string = "/api/v1";
initializeDatabase();


const addBusinessPath:string = `${baseApiPath}/business/add`;
app.post(addBusinessPath, (req: Request, res: Response) => addNewBusiness(db, req, res));

const modifyBusinessPath:string = (`${baseApiPath}/business/modify`);
app.post(`${modifyBusinessPath}/:id`, (req: Request, res: Response) => modifyBusiness(db, req, res));

const removeBusinessPath:string = `${baseApiPath}/business/remove`;
app.post(`${removeBusinessPath}/:id`, (req: Request, res: Response) => removeBusiness(db, req, res));

const businessDetailsPath:string = `${baseApiPath}/business`
app.get(`${businessDetailsPath}/:id`, (req: Request, res: Response) => getBusinessDetails(db, req, res));

const getBusinessesPath:string = `${baseApiPath}/businesses`;
app.get(getBusinessesPath, async (req: Request, res: Response) => getBusinesses(db, req, res));

const addReviewPath:string = `${baseApiPath}/review/add`;
app.post(addReviewPath, (req: Request, res: Response) => addReview(db, req, res));

const modifyReviewPath:string = `${baseApiPath}/review/modify`;
app.post(`${modifyReviewPath}/:id`, (req: Request, res: Response) => modifyReview(db, req, res));

const removeReviewPath:string = `${baseApiPath}/review/remove`; 
app.post(`${removeReviewPath}/:id`, (req: Request, res: Response) => removeReview(db, req, res));

const addPhotoPath:string = `${baseApiPath}/photo/add`
app.post(addPhotoPath, (req: Request, res: Response) => addPhoto(db, req, res));

const removePhotoPath:string = `${baseApiPath}/photo/remove`;
app.post(`${removePhotoPath}/:id`, (req: Request, res: Response) => removePhoto(db, req, res));

const modifyPhotoPath:string = `${baseApiPath}/photo/modify`;
app.post(`${modifyPhotoPath}/:id`, (req: Request, res: Response) => modifyPhoto(db, req, res));

const getphotosPath:string = `${baseApiPath}/photos`;
app.get(getphotosPath, (req: Request, res: Response) => getPhotos(db, req, res));

const getReviewsPath: string = `${baseApiPath}/reviews`;
app.get(getReviewsPath, (req: Request, res: Response) => getReviews(db, req, res));

// https://stackoverflow.com/questions/33547583/safe-way-to-extract-property-names

async function initializeDatabase() {
    console.log("Initializing database");
    const createBusinessTable:string = 
    `CREATE TABLE IF NOT EXISTS business(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
        owner_id MEDIUMINT UNSIGNED NOT NULL, 
        name VARCHAR(255) NOT NULL, 
        address VARCHAR(255) NOT NULL, 
        city VARCHAR(255) NOT NULL, 
        state VARCHAR(255) NOT NULL, 
        zip VARCHAR(255) NOT NULL, 
        phone VARCHAR(255) NOT NULL, 
        category VARCHAR(255) NOT NULL, 
        subcategory VARCHAR(255) NOT NULL, 
        website VARCHAR(255), email VARCHAR(255)
    )`;
    const createReviewTable: string = 
    `CREATE TABLE IF NOT EXISTS review (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
        business_id MEDIUMINT UNSIGNED NOT NULL, 
        owner_id MEDIUMINT UNSIGNED NOT NULL, 
        stars INT NOT NULL, 
        dollars INT NOT NULL,
        text TEXT NOT NULL
    )`;
    const createPhotoTable: string = 
    `CREATE TABLE IF NOT EXISTS photo(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
        owner_id INT UNSIGNED NOT NULL, 
        business_id INT UNSIGNED NOT NULL, 
        file_name VARCHAR(255) NOT NULL,
        caption TEXT NOT NULL
    )`;
    await db.execute(createBusinessTable);
    await db.execute(createReviewTable);
    await db.execute(createPhotoTable);
}

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}.`);
});

