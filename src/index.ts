import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Business, isValidBusiness } from './models/business';
import { Review, isValidReview } from './models/review';
import { Photo, isValidPhoto } from './models/photo';

const app: Express = express();
const port = process.env.PORT || 3000;

let businesses: Business[] = [];
let businessId: number = 0;
let reviews: Review[] = [];
let reviewId: number = 0;
let photos: Photo[] = [];
let photoId: number = 0;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const baseApiPath: string = "/api/v1";

const addBusinessPath = `${baseApiPath}/business/add`;
app.post(addBusinessPath, (req: Request, res: Response) => {
    console.log(`Attempting to add a business: ${JSON.stringify(req.body)}`);
    
    const new_business: Business = {
        id: ++businessId,
        ownerId: req.body["ownerId"],
        name: req.body["name"],
        address: req.body["address"],
        city: req.body["city"],
        state: req.body["state"],
        zip: req.body["zip"],
        phone: req.body["phone"],
        category: req.body["category"],
        subcategory: req.body["subcategory"],
        website: req.body["website"],
        email: req.body["email"]
    };

    if(!isValidBusiness(new_business)) { // either invalid values in request body, or missing fields from request body
        errorInvalidBody(res);
        return;
    }
    
    businesses.push(new_business);

    successResponse(res, {"business": new_business});
});

const modifyBusinessPath = (`${baseApiPath}/business/modify`);
app.post(`${modifyBusinessPath}/:id`, (req: Request, res: Response) => {

    const business_id:number = parseInt(req.params.id);
    let business_to_modify = businesses.find( (business) => business.id == business_id);

    if(!business_to_modify) { // the business is not in the system
        errorNotFound(res, "Business");
        return;
    }

    const owner_id = req.body['ownerId'];
    if(!owner_id) { // ownerId was not in the request body
        errorInvalidBody(res);
        return;
    }
    


    if(business_to_modify.ownerId != owner_id) { // someone other than the owner attempting to modify a business
        errorNoModify(res, "Business");
        return;
    }

    const modified_business: Business = {
        id: business_to_modify.id,
        ownerId: business_to_modify.ownerId,
        name: req.body['name'] ? req.body['name'] : business_to_modify.name,
        address: req.body['address'] ? req.body['address'] : business_to_modify.address,
        city: req.body['city'] ? req.body['city'] : business_to_modify.city,
        state: req.body['state'] ? req.body['state'] : business_to_modify.state,
        zip: req.body['zip'] ? req.body['zip'] : business_to_modify.zip,
        phone: req.body['phone'] ? req.body['phone'] : business_to_modify.phone,
        category: req.body['category'] ? req.body['category'] : business_to_modify.category,
        subcategory: req.body['subcategory'] ? req.body['subcategory'] : business_to_modify.subcategory,
        website: req.body['website'] ? req.body['website'] : business_to_modify.website,
        email: req.body['email'] ? req.body['email'] : business_to_modify.email
    };

    if(!isValidBusiness(modified_business)) {
        errorInvalidModification(res, "Business");
        return;
    }

    business_to_modify = modified_business;

    successResponse(res, {"business": business_to_modify})
});

const removeBusinessPath = `${baseApiPath}/business/remove`;
app.post(`${removeBusinessPath}/:id`, (req: Request, res: Response) => {
    
    const business_id:number = parseInt(req.params.id);
    const rb = businesses.find( (business) => business.id == business_id );
    
    if(!rb) {
        errorNotFound(res, "Business");
        return;
    }

    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        errorInvalidBody(res);
        return;
    }

    if(owner_id != rb.ownerId) {
        errorNoRemove(res, "Business");
        return;
    }

    const index: number = businesses.findIndex(bus => bus.id == rb.id);
    businesses.splice(index, 1);

    successResponse(res, {"message": "Removed Business", "business": rb})
});

const businessDetailsPath = `${baseApiPath}/business`
app.get(`${businessDetailsPath}/:id`, (req: Request, res: Response) => {
    
    const business_id:number = parseInt(req.params.id);
    const bd = businesses.find((bus) => bus.id == business_id );

    if(!bd) {
        errorNotFound(res, "Business");
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
    successResponse(res, details_response);
});

const getBusinessesPath = `${baseApiPath}/businesses`;
app.get(getBusinessesPath, (req: Request, res: Response) => {
    if(req.query.ownerId) {
        let owned_businesses: Business[] = [];
        const owner_id: number = parseInt(String(req.query.ownerId!));
        businesses.forEach( (business) => {
            if (business.ownerId == owner_id) {
                owned_businesses.push(business);
            }
        });

        successResponse(res, {"ownerId": req.query['ownerId'], "businesses": owned_businesses})
        return;
    }

    successResponse(res, {"businesses": businesses});
});

const addReviewPath = `${baseApiPath}/review/add`;
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
        genericErrorResponse(res, 403, "A user can only leave one Review per Business.");
        return;
    }

    if(!isValidReview(new_review)) {
        errorInvalidBody(res);
        return;
    }

    reviews.push(new_review);

    successResponse(res, {"review": new_review})
});

const modifyReviewPath = `${baseApiPath}/review/modify`;
app.post(`${modifyReviewPath}/:id`, (req: Request, res: Response) => {
    
    const owner_id = req.body['ownerId'];
    if(!owner_id) { // there is no ownerId in the request body
        errorInvalidBody(res);
        return;
    }

    const review_id:number = parseInt(req.params.id);
    let review_to_modify = reviews.find((review) => review.id == review_id);

    if(!review_to_modify) {
        errorNotFound(res, "Review");
        return;
    }

    if(review_to_modify.ownerId != owner_id) {
        errorNoModify(res, "Review");
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
        errorInvalidModification(res, "Review");
        return;
    }

    review_to_modify = modified_review;
    
    successResponse(res, {"review": review_to_modify});
});

const removeReviewPath = `${baseApiPath}/review/remove`; 
app.post(`${removeReviewPath}/:id`, (req: Request, res: Response) => {
    
    const review_id: number = parseInt(req.params.id);
    const review_to_remove = reviews.find((review) => review.id == review_id);

    if(!review_to_remove) {
        errorNotFound(res, "Review");
        return;
    }

    const owner_id: number = req.body['ownerId'];
    if(!owner_id) {
        errorInvalidBody(res);
        return;
    }

    if(owner_id != review_to_remove.ownerId) {
        errorNoRemove(res, "Review");
        return;
    }

    const index: number = businesses.findIndex(review => review.id == review_to_remove.id);
    reviews.splice(index, 1);

    successResponse(res, {"message": "Review removed.", "review": review_to_remove});
});

const addPhotoPath = `${baseApiPath}/photo/add`
app.post(addPhotoPath, (req: Request, res: Response) => {
    const new_photo: Photo = {
        id: ++photoId,
        userId: req.body['userId'],
        businessId: req.body['businessId'],
        fileName: req.body['fileName'],
        caption: req.body['caption']
    };

    if(!isValidPhoto(new_photo)) {
        errorInvalidBody(res);
        return;
    }

    photos.push(new_photo);

    successResponse(res, {"photo": new_photo})
});

const removePhotoPath = `${baseApiPath}/photo/remove`;
app.post(`${removePhotoPath}/:id`, (req: Request, res: Response) => {
    
    const photo_id: number = parseInt(req.params.id);
    const photo_to_remove = photos.find((photo) => photo.id == photo_id);

    if(!photo_to_remove) {
        errorNotFound(res, "Photo");
        return;
    }

    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        errorInvalidBody(res);
        return;
    }

    if(owner_id != photo_to_remove.userId) {
        errorNoRemove(res, "Photo");
        return;
    }

    const index: number = photos.findIndex(photo => photo.id == photo_to_remove.id);
    photos.splice(index, 1);

    successResponse(res, {"message": "Photo removed.", "photo": photo_to_remove})
});

const modifyPhotoPath = `${baseApiPath}/photo/modify`;
app.post(`${modifyPhotoPath}/:id`, (req: Request, res: Response) => {
    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        errorInvalidBody(res);
        return;
    }

    const photo_id: number = parseInt(req.params.id);
    let photo_to_modify = photos.find( (photo) => photo.id == photo_id);
    if(!photo_to_modify) {
        errorNotFound(res, "Photo");
        return;
    }

    if(photo_to_modify.userId != owner_id) {
        errorNoModify(res, "Photo");
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
        errorInvalidModification(res, "Photo");
        return;
    }

    photo_to_modify = modified_photo;
    res.status(200);
    res.json({
        "status": "success",
        "photo": photo_to_modify
    });
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

function genericErrorResponse(res: Response, statusCode: number, message: string): void {
    res.status(statusCode).json({
        "status": "error",
        "message": message
    });
}

function errorNotFound(res: Response, type:string) {
    genericErrorResponse(res, 404, `${type} not found.`);
}

function errorNoModify(res: Response, type: string) {
    genericErrorResponse(res, 401, `Cannot modify a ${type} you did not create.`);
}

function errorNoRemove(res: Response, type: string) {
    genericErrorResponse(res, 401, `Cannot remove a ${type} you did not create.`);
}

function errorInvalidBody(res: Response) {
    genericErrorResponse(res, 406, "Invalid request body.");
}

function errorInvalidModification(res: Response, type: string) {
    genericErrorResponse(res, 403, `Modified ${type} is not valid.`);
}

function successResponse(res: Response, successDetails: Object) {
    const success_json = {
        "status": "success"
    };

    Object.assign(success_json, successDetails);
    
    res.status(200).json(success_json);
}

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}.`);
});
