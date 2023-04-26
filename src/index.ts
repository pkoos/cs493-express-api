import express, { Express, Request, Response, application } from 'express';
import bodyParser from 'body-parser';
import { Business, isValidBusiness } from './models/business';
import { Review, isValidReview } from './models/review';
import { Photo, isValidPhoto } from './models/photo';
import { error } from 'console';

const app: Express = express();
const port = 3000;

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
        errorResponse(res, 400, "Invalid body");
        return;
    }
    
    businesses.push(new_business);
    res.status(200)
    res.json({
        "status": "success",
        "business": new_business
    });
});

const modifyBusinessPath = (`${baseApiPath}/business/modify`);
app.post(`${modifyBusinessPath}/:id`, (req: Request, res: Response) => {

    const business_id:number = parseInt(req.params.id);
    let business_to_modify = businesses.find((business) => {
        return business.id == business_id;
    });

    if(!business_to_modify) { // the business is not in the system
        errorResponse(res, 400, "Business not found.");
        return;
    }

    const owner_id = req.body['ownerId'];
    if(!owner_id) { // ownerId was not in the request body
        errorResponse(res, 400, "Invalid request body.");
        return;
    }
    


    if(business_to_modify.ownerId != owner_id) { // someone other than the owner attempting to modify a business
        errorResponse(res, 400, "Cannot modify a business you do not own.");
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
        errorResponse(res, 400, "Modified business is not valid.");
        return;
    }

    business_to_modify = modified_business;

    res.status(200);
    res.json({
        "status": "success",
        "business": business_to_modify
    });
});

const removeBusinessPath = `${baseApiPath}/business/remove`;
app.post(`${removeBusinessPath}/:id`, (req: Request, res: Response) => {
    
    const business_id:number = parseInt(req.params.id);
    const rb = businesses.find( (business) => {
        return business.id == business_id;
    })
    
    if(!rb) {
        errorResponse(res, 400, "Business not found.");
        return;
    }

    const owner_id: number = req.body["ownerId"];
    if(!owner_id) {
        errorResponse(res, 400, "Invalid request body.");
        return;
    }
    
    if(owner_id != rb.ownerId) {
        errorResponse(res, 400, "Unauthorized to remove a business you do not own.");
        return;
    }

    const index: number = businesses.findIndex(bus => bus.id == rb.id);
    businesses.splice(index, 1);

    res.status(200);
    res.json({
        "status": "success",
        "message": "removed business",
        "business": rb
    });
});

const businessDetailsPath = `${baseApiPath}/business`
app.get(`${businessDetailsPath}/:id`, (req: Request, res: Response) => {
    console.log("Attempting to get business details");
    const business_id:number = parseInt(req.params.id);
    const bd = businesses.find((bus) => {
        return bus.id == business_id;
    });
    if(bd) {
        console.log(`Business details found for businessId: ${business_id}`);

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
        
        res.status(200);
        res.json(details_response);
    }
    else {
        res.status(400);
        res.json({
            "status": "error",
            "message": "invalid businessId"
        });
    }
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
        res.status(200);
        res.json({
            "status": "success",
            "ownerId": req.query['ownerId'],
            "businesses": owned_businesses
        })
    } else {
        res.status(200);
        res.json({
            "status": "success",
            "businesses": businesses
        });
    }

    
});

const addReviewPath = `${baseApiPath}/review/add`;
app.post(addReviewPath, (req: Request, res: Response) => {
    console.log("adding a review!");
    const nr: Review = {
        id: ++reviewId,
        businessId: req.body['businessId'],
        ownerId: req.body['ownerId'],
        stars: req.body['stars'],
        dollars: req.body['dollars'],
        reviewText: req.body['reviewText']
    };

    if(isValidReview(nr)) {
        reviews.push(nr);
        res.status(200);
        res.json({
            "status": "success",
            "review": nr
        });
    }
    else {
        res.status(400);
        res.json({
            "status": "error",
            "message": "invalid body"
        });
    }
});

const modifyReviewPath = `${baseApiPath}/review/modify`;
app.post(`${modifyReviewPath}/:id`, (req: Request, res: Response) => {
    
    const review_id:number = parseInt(req.params.id);

    const owner_id = req.body['ownerId'];
    if(!owner_id) { // there is no ownerId in the request body
        res.status(400);
        res.json({
            "status": "error",
            "message": "Invalid request body"
        });
        return;
    }

    let mr = reviews.find( (review) => {
        return review.id == review_id;
    })

    if (mr) {
        if (mr.ownerId == owner_id) {
            const modified_review:Review = {
                id: mr.id,
                businessId: req.body['businessId'] ? req.body['businessId'] : mr.businessId,
                ownerId: mr.ownerId,
                stars: req.body['stars'] ? req.body['stars'] : mr.stars,
                dollars: req.body['dollars'] ? req.body['dollars'] : mr.dollars,
                reviewText: req.body['reviewText'] ? req.body['reviewText'] : mr.reviewText
            }
            if(isValidReview(modified_review)) {
                mr = modified_review;
                res.status(200);
                res.json({
                    "status": "success",
                    "review": mr
                });
            } else {
                res.status(400);
                res.json({
                    "status": "error",
                    "message": "Modified review is not valid."
                })
            }
        } else {
            res.status(400);
            res.json({
                "status": "error",
                "message": "Cannot modify a review you did not write."
            });
        }
    } else {
        res.status(400);
        res.json({
            "status": "error",
            "message": "Review not found"
        });
    }
});

const removeReviewPath = `${baseApiPath}/review/remove`; 
app.post(`${removeReviewPath}/:id`, (req: Request, res: Response) => {
    const business_id: number = parseInt(req.params.id);
    const request_owner_id: number = req.body['ownerId'];

    if(!request_owner_id) {
        res.status(400);
        res.json({
            "status": "error",
            "message": "Invalid request body."
        });
        return;
    }
});

const addPhotoPath = `${baseApiPath}/photo/add`
app.post(addPhotoPath, (req: Request, res: Response) => {
    console.log("adding a photo!");
    console.log(JSON.stringify(req.body));
    const new_photo: Photo = {
        id: ++photoId,
        userId: req.body['userId'],
        businessId: req.body['businessId'],
        fileName: req.body['fileName'],
        caption: req.body['caption']
    };

    if(isValidPhoto(new_photo)) {
        photos.push(new_photo);
        res.statusCode = 200;
        res.json({
            "status": "success",
            "photo": new_photo
        });
    }
    else {
        res.status(400);
        res.json({
            "status": "error",
            "message": "invalid body"
        });
    }
});

const removePhotoPath = `${baseApiPath}/photo/remove`;
app.post(`${removePhotoPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${removePhotoPath} received`);
});

const modifyPhotoPath = `${baseApiPath}/photo/modify/:id`;
app.post(`${modifyPhotoPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${modifyPhotoPath} received`);
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

function errorResponse(res: Response, statusCode: number, message: string): void {
    res.status(statusCode);
    res.json({
        "status": "error",
        "message": message
    })
}

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}, or 172.31.47.53:${port} remotely`);
});