import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import mysql2, { Pool } from 'mysql2/promise';
import { Business, getBusinesses, addNewBusiness, modifyBusiness, removeBusiness } from './models/business';
import { Review, isValidReview } from './models/review';
import { Photo, isValidPhoto } from './models/photo';
import * as rh from './controllers/responses-helper';

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

let businesses: Business[] = [];
let reviews: Review[] = [];
let reviewId: number = 0;
let photos: Photo[] = [];
let photoId: number = 0;

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
app.get(`${businessDetailsPath}/:id`, (req: Request, res: Response) => {
    
    const business_id:number = parseInt(req.params.id);
    const bd = businesses.find((bus) => bus.id == business_id );

    if(!bd) {
        rh.errorNotFound(res, "Business");
        return;
    }

    let business_reviews: Review[] = [];
    reviews.forEach( (review) => {
        if (review.businessId == business_id) {
            business_reviews.push(review);
        }
    });

    let business_photos: Photo[] = [];
    photos.forEach( (photo) => {
        if(photo.businessId == business_id) {
            business_photos.push(photo);
        }
    });

    const details_response = {
        "business": bd,
        "photos": business_photos,
        "reviews": business_reviews
    }
    rh.successResponse(res, details_response);
});

const getBusinessesPath:string = `${baseApiPath}/businesses`;
app.get(getBusinessesPath, async (req: Request, res: Response) => getBusinesses(db, req, res));


const addReviewPath:string = `${baseApiPath}/review/add`;
app.post(addReviewPath, (req: Request, res: Response) => {

    const new_review: Review = {
        id: ++reviewId,
        businessId: req.body['businessId'],
        ownerId: req.body['ownerId'],
        stars: req.body['stars'],
        dollars: req.body['dollars'],
        reviewText: req.body['reviewText']
    };

    const existing_review = reviews.find( (review) => review.ownerId == new_review.ownerId && review.businessId == new_review.businessId );

    if(existing_review) { // one review per user per business
        rh.genericErrorResponse(res, 403, "A user can only leave one Review per Business.");
        return;
    }

    if(!isValidReview(new_review)) {
        rh.errorInvalidBody(res);
        return;
    }

    reviews.push(new_review);

    rh.successResponse(res, {"review": new_review})
});

const modifyReviewPath:string = `${baseApiPath}/review/modify`;
app.post(`${modifyReviewPath}/:id`, (req: Request, res: Response) => {
    
    const owner_id = req.body['ownerId'];
    if(!owner_id) { // there is no ownerId in the request body
        rh.errorInvalidBody(res);
        return;
    }

    const review_id:number = parseInt(req.params.id);
    let review_to_modify = reviews.find((review) => review.id == review_id);

    if(!review_to_modify) {
        rh.errorNotFound(res, "Review");
        return;
    }

    if(review_to_modify.ownerId != owner_id) {
        rh.errorNoModify(res, "Review");
        return;
    }

    const modified_review:Review = {
        id: review_to_modify.id,
        businessId: req.body['businessId'] ? req.body['businessId'] : review_to_modify.businessId,
        ownerId: review_to_modify.ownerId,
        stars: req.body['stars'] ? req.body['stars'] : review_to_modify.stars,
        dollars: req.body['dollars'] ? req.body['dollars'] : review_to_modify.dollars,
        reviewText: req.body['reviewText'] ? req.body['reviewText'] : review_to_modify.reviewText
    }
    
    if(!isValidReview(modified_review)) {
        rh.errorInvalidModification(res, "Review");
        return;
    }

    review_to_modify = modified_review;
    
    rh.successResponse(res, {"review": review_to_modify});
});

const removeReviewPath:string = `${baseApiPath}/review/remove`; 
app.post(`${removeReviewPath}/:id`, (req: Request, res: Response) => {
    
    const review_id: number = parseInt(req.params.id);
    const review_to_remove = reviews.find((review) => review.id == review_id);

    if(!review_to_remove) {
        rh.errorNotFound(res, "Review");
        return;
    }

    const owner_id: number = req.body['ownerId'];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(owner_id != review_to_remove.ownerId) {
        rh.errorNoRemove(res, "Review");
        return;
    }

    const index: number = businesses.findIndex(review => review.id == review_to_remove.id);
    reviews.splice(index, 1);

    rh.successResponse(res, {"message": "Review removed.", "review": review_to_remove});
});

const addPhotoPath:string = `${baseApiPath}/photo/add`
app.post(addPhotoPath, (req: Request, res: Response) => {
    const new_photo: Photo = {
        id: ++photoId,
        userId: req.body['userId'],
        businessId: req.body['businessId'],
        fileName: req.body['fileName'],
        caption: req.body['caption']
    };

    if(!isValidPhoto(new_photo)) {
        rh.errorInvalidBody(res);
        return;
    }

    photos.push(new_photo);

    rh.successResponse(res, {"photo": new_photo})
});

const removePhotoPath:string = `${baseApiPath}/photo/remove`;
app.post(`${removePhotoPath}/:id`, (req: Request, res: Response) => {
    
    const photo_id: number = parseInt(req.params.id);
    const photo_to_remove = photos.find((photo) => photo.id == photo_id);

    if(!photo_to_remove) {
        rh.errorNotFound(res, "Photo");
        return;
    }

    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    if(owner_id != photo_to_remove.userId) {
        rh.errorNoRemove(res, "Photo");
        return;
    }

    const index: number = photos.findIndex(photo => photo.id == photo_to_remove.id);
    photos.splice(index, 1);

    rh.successResponse(res, {"message": "Photo removed.", "photo": photo_to_remove})
});

const modifyPhotoPath:string = `${baseApiPath}/photo/modify`;
app.post(`${modifyPhotoPath}/:id`, (req: Request, res: Response) => {
    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        rh.errorInvalidBody(res);
        return;
    }

    const photo_id: number = parseInt(req.params.id);
    let photo_to_modify = photos.find( (photo) => photo.id == photo_id);
    if(!photo_to_modify) {
        rh.errorNotFound(res, "Photo");
        return;
    }

    if(photo_to_modify.userId != owner_id) {
        rh.errorNoModify(res, "Photo");
        return;
    }

    const modified_photo: Photo = {
        id: photo_to_modify.id, 
        businessId: photo_to_modify.businessId,
        userId: photo_to_modify.userId,
        fileName: photo_to_modify.fileName,
        caption: req.body["caption"] ? req.body["caption"] : photo_to_modify.caption
    }

    if(!isValidPhoto(modified_photo)) {
        rh.errorInvalidModification(res, "Photo");
        return;
    }

    photo_to_modify = modified_photo;
    res.status(200);
    res.json({
        "status": "success",
        "photo": photo_to_modify
    });
});

const getphotosPath:string = `${baseApiPath}/photos`;
app.get(getphotosPath, (req: Request, res: Response) => {
    if (req.query.ownerId) {
        let owned_photos: Photo[] = [];
        const owner_id: number = parseInt(String(req.query.ownerId));
        photos.forEach( (photo) => {
            if(photo.userId == owner_id) {
                owned_photos.push(photo);
            }
        });

        rh.successResponse(res, {"ownerId": req.query.ownerId, "photos": owned_photos});
        return;
    }
    
    rh.genericErrorResponse(res, 400, "Missing ownerId query");
});

const getReviewsPath: string = `${baseApiPath}/reviews`;
app.get(getReviewsPath, (req: Request, res: Response) => {
    if(req.query.ownerId) {
        let owned_reviews: Review[] = [];
        const owner_id:number = parseInt(String(req.query.ownerId));
        reviews.forEach( (review) => {
            if(review.ownerId == owner_id) {
                owned_reviews.push(review);
            }
        });

        rh.successResponse(res, {"ownerId": req.query.ownerId, "reviews": owned_reviews});
        return;
    }

    rh.genericErrorResponse(res, 400, "Missing ownerId query");
});

// const addUserPath = `${baseApiPath}/user/add`;
// app.post(addUserPath, (req: Request, res: Response) => {
//     // console.log(`POST ${addUserPath} received`);
//     // res.status(200);
//     // const body = req.body;
//     // res.json(req.body);
//     // const newUser:User = new User(1, req.body["email"], req.body["password"], req.body["isBusinessOwner"]);
//     // console.log(newUser);
// });

// const userLoginPath = `${baseApiPath}/user/login`;
// app.post(userLoginPath, (req: Request, res: Response) => {
//     console.log(`GET ${userLoginPath} received`);
//     res.status(200);
// });

// const userBusinessesPath = `${baseApiPath}/user/businesses`
// app.get(userBusinessesPath, (req: Request, res: Response) => {     res.status(200);
//     res.status(200);
//     res.send(`GET ${userBusinessesPath} received`);
// });

// const userReviewsPath = `${baseApiPath}/users/reviews`
// app.get(userReviewsPath, (req: Request, res: Response) => {     res.status(200);
//     res.status(200);
//     res.send(`GET ${userReviewsPath} received`);
// });

// const userPhotosPath = `${baseApiPath}/users/photos`;
// app.get(userPhotosPath, (req: Request, res: Response) => {     res.status(200);
//     res.status(200);
//     res.send(`GET ${userPhotosPath} received`);
// });

// https://stackoverflow.com/questions/33547583/safe-way-to-extract-property-names

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}.`);
});
