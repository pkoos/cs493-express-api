/*
    Package Imports
*/
import express, { Express, NextFunction, Request, Response,  } from 'express';
import bodyParser from 'body-parser';
import mysql2, { Pool, OkPacket } from 'mysql2/promise';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import multer, {Multer} from 'multer';
import crypto from 'crypto';

/*
    Project Imports
*/
import * as rh from './controllers/responses-helper';
import { getBusinesses, addNewBusiness, modifyBusiness, removeBusiness, getBusinessDetails } from './controllers/business-controller';
import { addReview, modifyReview, removeReview, getReviews } from './controllers/review-controller';
import { addPhoto, getPhotos, modifyPhoto, removePhoto } from './controllers/photo-controller';
import { addUser, getUserDetails, loginUser } from './controllers/user-controller';
import { Image } from './models/image';
import { addNewImage } from './controllers/image-controller';
import fs from 'fs';

const imageTypes: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const app: Express = express();
const port = process.env.PORT ?? 8000;
export const db:Pool = mysql2.createPool({
    connectionLimit: 10,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST ?? "localhost",
    port: 3306
});

// const upload: Multer = multer({
//     storage: multer.memoryStorage(),
//     fileFilter: (req: Request, file: Express.Multer.File, callback) => {
//         callback(null, !!imageTypes[file.mimetype]);
//     }
// });
const upload: Multer = multer({
    storage: multer.diskStorage({
        destination: `${__dirname}/uploads`,
        filename: (req: Request, file: Express.Multer.File, callback: CallableFunction) => {
            const filename: string = crypto.pseudoRandomBytes(16).toString('hex');
            const extension: string = imageTypes[file.mimetype];
            callback(null, `${filename}.${extension}`);
        }
    }),
    fileFilter: (req: Request, file: Express.Multer.File, callback: CallableFunction) => {
        callback(null, !!imageTypes[file.mimetype]);
    }
});


dotenv.config();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('*', (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send({
        err: "An error occurred. Try again later."
    });
});
app.use(bodyParser.json());

const pageSize: number = 5;
const baseApiPath: string = "/api/v1";
initializeDatabase();

const addBusinessPath:string = `${baseApiPath}/business/add`;
app.post(addBusinessPath, requireAuthentication, (req: Request, res: Response) => addNewBusiness(req, res));

const modifyBusinessPath:string = (`${baseApiPath}/business/modify`);
app.post(`${modifyBusinessPath}/:id`, requireAuthentication, (req: Request, res: Response) => modifyBusiness(req, res));

const removeBusinessPath:string = `${baseApiPath}/business/remove`;
app.post(`${removeBusinessPath}/:id`, requireAuthentication, (req: Request, res: Response) => removeBusiness(req, res));

const businessDetailsPath:string = `${baseApiPath}/business`
app.get(`${businessDetailsPath}/:id`, requireAuthentication, (req: Request, res: Response) => getBusinessDetails(req, res));

const getBusinessesPath:string = `${baseApiPath}/businesses`;
app.get(getBusinessesPath, (req: Request, res: Response) => getBusinesses(req, res));

const addReviewPath:string = `${baseApiPath}/review/add`;
app.post(addReviewPath, requireAuthentication, (req: Request, res: Response) => addReview(req, res));

const modifyReviewPath:string = `${baseApiPath}/review/modify`;
app.post(`${modifyReviewPath}/:id`, requireAuthentication, (req: Request, res: Response) => modifyReview(req, res));

const removeReviewPath:string = `${baseApiPath}/review/remove`; 
app.post(`${removeReviewPath}/:id`, requireAuthentication, (req: Request, res: Response) => removeReview(req, res));

const addPhotoPath:string = `${baseApiPath}/photo/add`
app.post(addPhotoPath, requireAuthentication, (req: Request, res: Response) => addPhoto(req, res));

const removePhotoPath:string = `${baseApiPath}/photo/remove`;
app.post(`${removePhotoPath}/:id`, requireAuthentication, (req: Request, res: Response) => removePhoto(req, res));

const modifyPhotoPath:string = `${baseApiPath}/photo/modify`;
app.post(`${modifyPhotoPath}/:id`, requireAuthentication, (req: Request, res: Response) => modifyPhoto(req, res));

const getphotosPath:string = `${baseApiPath}/photos`;
app.get(getphotosPath, requireAuthentication, (req: Request, res: Response) => getPhotos(req, res));

const getReviewsPath: string = `${baseApiPath}/reviews`;
app.get(getReviewsPath, requireAuthentication, (req: Request, res: Response) => getReviews(req, res));

const addUserPath: string = `${baseApiPath}/user/add`;
app.post(addUserPath, (req: Request, res: Response) => addUser(req, res));

const loginUserPath: string = `${baseApiPath}/user/login`;
app.post(loginUserPath, (req: Request, res: Response) => loginUser(req, res));

const userDetailsPath: string = `${baseApiPath}/users`;
app.get(`${userDetailsPath}/:id`, requireAuthentication, (req: Request, res: Response) => getUserDetails(req, res));

const addImagePath: string = `${baseApiPath}/images`;
app.post(addImagePath, upload.single('image'), requireAuthentication, (req: Request, res: Response) => addNewImage(req, res));

const getImagesPath: string = `${baseApiPath}/images`;
app.get(`${getImagesPath}/:id`, async (req: Request, res: Response, next: NextFunction) => {
    // Get image from database
    // Build image url
    // Send response

    const image_id: number = parseInt(req.params.id);
    const queryString: string = "SELECT * FROM image WHERE id=?";
    const params: any[] = [image_id];
    const [results] = await db.query(queryString, params);
    if((results as OkPacket[]).length < 1){
        rh.errorNotFound(res, "Image");
        return;
    }
    const found_image: Image = Image.fromDatabase((results as any[]));
    delete found_image.path;
    const response_body = {
        _id: found_image.id,
        url: `/media/images/${found_image.filename}`,
        contentType: found_image.image_content_type,
        userId: found_image.owner_id
    }
    res.status(200).send(response_body);
    
});

const staticImageURLPath: string = `/media/images`;
app.get(`${staticImageURLPath}/:filename`, async (req:Request, res: Response) => {
    const filename: string = req.params.filename;
    const queryString: string = "SELECT * FROM image WHERE filename=?";
    const [ db_results ] = await db.query(queryString, [filename]);
    if((db_results as OkPacket[]).length < 1){
        rh.errorNotFound(res, "Image");
        return;
    }

    const found_image: Image = Image.fromDatabase(db_results as any[]);
    res.status(200).contentType(found_image.image_content_type).send(found_image.image_data);


});

// https://stackoverflow.com/questions/33547583/safe-way-to-extract-property-names

async function initializeDatabase() {
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
    const createUserTable: string = 
    `
    CREATE TABLE IF NOT EXISTS user(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(60) NOT NULL,
        admin BOOLEAN NOT NULL
    )`;

    const createImageTable: string = 
    `
    CREATE TABLE IF NOT EXISTS image(
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        owner_id INT UNSIGNED NOT NULL,
        filename VARCHAR(255) NOT NULL,
        path VARCHAR(1024) NOT NULL,
        image_content_type VARCHAR(10),
        image_data MEDIUMBLOB,
        thumbnail_content_type VARCHAR(10),
        thumbnail_data MEDIUMBLOB
    )`;
    
    await db.execute(createBusinessTable);
    await db.execute(createReviewTable);
    await db.execute(createPhotoTable);
    await db.execute(createUserTable);
    await db.execute(createImageTable);
}

export function getPageSize(): number {
    return pageSize;
}

export function validatePageSize(page: number, max_page: number): number {
    if(page == undefined || page < 1) {
        return 1;
    }
    if(page > max_page) {
        return max_page;
    }

    return page;
}

export function generateAuthToken(user_id: number): string {
    const payload = { sub: user_id };

    return jwt.sign(payload, process.env.SECRET_KEY ?? '', { expiresIn: '24h'});
}

export function requireAuthentication(req: Request, res: Response, next: NextFunction) {
    const auth_header: string = req.get("Authorization") as string;
    if(!auth_header) {
        rh.errorInvalidToken(res);
        return;
    }
    const auth_header_parts: string[] = auth_header.split(" ");
    const token: string = auth_header_parts[0] === "Bearer" ? auth_header_parts[1] : "";
    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY ?? '');
        req.loggedInID = parseInt(payload.sub as string);
    }
    catch {
        rh.errorInvalidToken(res);
        return;
    }
    next();
}

function removeUploadedFile(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
        fs.unlink(file.path, (err) => {
            if(err) {
                reject(err);
            }
            else {
                console.log(`File deleted from ${file.path}.`);
            }
        });
    });
}

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}.`);
});
