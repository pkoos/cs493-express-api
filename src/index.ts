import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import mysql2, { Pool } from 'mysql2/promise';
import { Business, getBusinesses, addNewBusiness, modifyBusiness, removeBusiness, getBusinessDetails } from './models/business';
import { Review, addReview, modifyReview, removeReview, getReviews } from './models/review';
import { Photo, addPhoto, getPhotos, modifyPhoto, removePhoto } from './models/photo';
// import * as rh from './controllers/responses-helper';

const app: Express = express();
const port = process.env.PORT || 3000;
const db:Pool = mysql2.createPool({
    connectionLimit: 10,
    user: "busi-user",
    password: "asdfqwer1234",
    database: "busirate",
    host: "localhost",
    port: 3306
});

// let reviews: Review[] = [];
// let photos: Photo[] = [];

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const baseApiPath: string = "/api/v1";

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
// {
//     if (req.query.ownerId) {
//         let owned_photos: Photo[] = [];
//         const owner_id: number = parseInt(String(req.query.ownerId));
//         photos.forEach( (photo) => {
//             if(photo.ownerId == owner_id) {
//                 owned_photos.push(photo);
//             }
//         });

//         rh.successResponse(res, {"ownerId": req.query.ownerId, "photos": owned_photos});
//         return;
//     }
    
//     rh.genericErrorResponse(res, 400, "Missing ownerId query");
// });

const getReviewsPath: string = `${baseApiPath}/reviews`;
app.get(getReviewsPath, (req: Request, res: Response) => getReviews(db, req, res));
// {
//     if(req.query.ownerId) {
//         let owned_reviews: Review[] = [];
//         const owner_id:number = parseInt(String(req.query.ownerId));
//         reviews.forEach( (review) => {
//             if(review.ownerId == owner_id) {
//                 owned_reviews.push(review);
//             }
//         });

//         rh.successResponse(res, {"ownerId": req.query.ownerId, "reviews": owned_reviews});
//         return;
//     }

//     rh.genericErrorResponse(res, 400, "Missing ownerId query");
// });

// https://stackoverflow.com/questions/33547583/safe-way-to-extract-property-names

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}.`);
});
