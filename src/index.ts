import express, { Express, Request, Response, application } from 'express';
import bodyParser from 'body-parser';
import { Business, isValidBusiness } from './models/business';
import { Review, isValidReview } from './models/review';
import { Photo, isValidPhoto } from './models/photo';

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
    
    const nb: Business = {
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
    if(isValidBusiness(nb)) {
        businesses.push(nb);
        res.statusCode = 200;
        res.json({
            "status": "success",
            "business": nb
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

const modifyBusinessPath = (`${baseApiPath}/business/modify`);
app.post(`${modifyBusinessPath}/:id`, (req: Request, res: Response) => {
    const business_id:number = parseInt(req.params.id);
    let mb = businesses.find((bus) => {
        return bus.id == business_id;
    });
    const owner_id = req.body['ownerId'];

    if (mb) { // the business exists
        if (mb.ownerId == owner_id) { // the ownerId matches the business
            console.log(`Owner matches business owner.`);
            
            mb.name = req.body['name'] ? req.body['name'] : mb.name;
            mb.address = req.body['address'] ? req.body['address'] : mb.address;
            mb.city = req.body['city'] ? req.body['city'] : mb.city;
            mb.state = req.body['state'] ? req.body['state'] : mb.state;
            mb.zip = req.body['zip'] ? req.body['zip'] : mb.zip;
            mb.phone = req.body['phone'] ? req.body['phone'] : mb.phone;
            mb.category = req.body['category'] ? req.body['category'] : mb.category;
            mb.subcategory = req.body['subcategory'] ? req.body['subcategory'] : mb.subcategory;
            mb.website = req.body['website'] ? req.body['website'] : mb.website;
            mb.email = req.body['email'] ? req.body['email'] : mb.email;
            res.status(200);
            res.json({
                "status": "success",
                "business": mb
            });
        }
        else { // requester does not own the business
            res.status(400);
            res.json({
                "status": "error",
                "message": "Cannot modify a business you do not own."
            });
        }
    }
    else {
        res.status(404)
        res.json({
            "status": "error",
            "message": "business not found"
        });
    }

});

const removeBusinessPath = `${baseApiPath}/business/remove`;
app.post(`${removeBusinessPath}/:id`, (req: Request, res: Response) => {
    const business_id:number = parseInt(req.params.id);
    const request_owner_id = req.body["ownerId"];

    if (request_owner_id != undefined) {
        const rb = businesses.find((bus) => {
            return bus.id == business_id;
        });
        if(rb && request_owner_id == rb.ownerId) {
            const index: number = businesses.findIndex(bus => bus.id == rb.id);
            businesses.splice(index, 1);
        } else {
            res.status(400);
            res.json({
                "status": "error",
                "message": "Unauthorized to remove a business you do not own."
            });
        }
        res.status(200);
        res.json({
            "status": "success",
            "message": "removed business",
            "business": rb
        });
    }
    else {
        res.status(400);
        res.json({
            "status": "error",
            "message": "Invalid request body."
        });
    }
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
        stars: req.body['stars'],
        dollars: req.body['dollars'],
        reviewText: req.body['reviewText']
    };

    if(isValidReview(nr)) {
        reviews.push(nr);
        res.statusCode = 200;
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
    res.status(200);
    res.send(`GET ${modifyReviewPath} received`);
});

const removeReviewPath = `${baseApiPath}/review/remove`; 
app.post(`${removeReviewPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${removeReviewPath} received`);
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

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}, or 172.31.47.53:${port} remotely`);
});