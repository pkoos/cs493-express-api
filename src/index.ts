import express, { Express, Request, Response, application } from 'express';
import bodyParser from 'body-parser';
import { Business, isValidBusiness, findById } from './models/business';
import { Review, isValidReview } from './models/review';
import { Photo, isValidPhoto } from './models/photo';
// import { User } from './models/user';
// import * as dotenv from 'dotenv';
// import { DbController } from './controllers/db-controller';
// import { UserController } from './controllers/user-controller';

const app: Express = express();
const port = 3000;
// const db = new DbController();
// console.log(db);
// dotenv.config();

let businesses: Business[] = [];
let reviews: Review[] = [];
let photos: Photo[] = [];


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const baseApiPath: string = "/api/v1";

const addBusinessPath = `${baseApiPath}/business/add`;
app.post(addBusinessPath, (req: Request, res: Response) => {
    const nb: Business = {
        id: businesses.length + 1,
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
        res.json({"status": "success",
        "business": nb})
        console.log("It's valid! Congratulations");
    }
    else {
        console.log("wtf did I receive?!?!?!?");
        res.status(400);
        res.json({"status": "invalid body"})
    }
});

const modifyBusinessPath = (`${baseApiPath}/business/modify`);
app.post(`${modifyBusinessPath}/:id`, (req: Request, res: Response) => {
    const business_id:number = parseInt(req.params.id);
    let mb = businesses.find((bus) => {
        return bus.id == business_id;
    })
    if (mb) {
        res.status(200);
        res.send("Match found!");    
    }
    else {
        res.status(404)
        res.send("Match not found");
    }
    // console.log(mb);
    // res.status(200);
    // res.send(`POST ${modifyBusinessPath} received`);
});

const removeBusinessPath = `${baseApiPath}/business/remove`;
app.post(`${removeBusinessPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${removeBusinessPath} received`);
});

const businessDetailsPath = `${baseApiPath}/business/`
app.get(`${businessDetailsPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`GET ${businessDetailsPath} received`);
});

const getBusinessesPath = `${baseApiPath}/businesses`;
app.get(getBusinessesPath, (req: Request, res: Response) => {
    res.statusCode = 200;
    res.json(businesses);
    
});

const addReviewPath = `${baseApiPath}/review/add`;
app.post(addReviewPath, (req: Request, res: Response) => {
    res.status(200);
    res.send(`GET ${addReviewPath} received`);
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
    res.status(200);
    res.send(`POST ${addPhotoPath} received`);
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

const addUserPath = `${baseApiPath}/user/add`;
app.post(addUserPath, (req: Request, res: Response) => {
    // console.log(`POST ${addUserPath} received`);
    // res.status(200);
    // const body = req.body;
    // res.json(req.body);
    // const newUser:User = new User(1, req.body["email"], req.body["password"], req.body["isBusinessOwner"]);
    // console.log(newUser);
});

const userLoginPath = `${baseApiPath}/user/login`;
app.post(userLoginPath, (req: Request, res: Response) => {
    console.log(`GET ${userLoginPath} received`);
    res.status(200);
});

const userBusinessesPath = `${baseApiPath}/user/businesses`
app.get(userBusinessesPath, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${userBusinessesPath} received`);
});

const userReviewsPath = `${baseApiPath}/users/reviews`
app.get(userReviewsPath, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${userReviewsPath} received`);
});

const userPhotosPath = `${baseApiPath}/users/photos`;
app.get(userPhotosPath, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${userPhotosPath} received`);
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}, or 172.31.47.53:${port} remotely`);
});