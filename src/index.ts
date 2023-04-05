import express, { Express, Request, Response, application } from 'express';
import bodyParser from 'body-parser';
import { Business } from "./models/business";
import {Api} from './models/api';
import { User } from './models/user';
import { Database } from 'sqlite3';
import * as dotenv from 'dotenv';

const app: Express = express();
const port = 3000;
const db = new Database('db.sqlite');
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const addBusinessPath = `${Api.BusinessPath}/add`;
app.post(addBusinessPath, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${addBusinessPath} received`);
});

const modifyBusinessPath = (`${Api.BusinessPath}/modify`);
app.post(`${modifyBusinessPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${modifyBusinessPath} received`);
});

const removeBusinessPath = `${Api.BusinessPath}/remove`;
app.post(`${removeBusinessPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${removeBusinessPath} received`);
});

const getBusinessesPath = `${Api.BusinessPath}es`;
app.get(getBusinessesPath, (req: Request, res: Response) => {
    res.status(200);
    res.send(`GET ${getBusinessesPath} received`);
});

const addReviewPath = `${Api.ReviewPath}/add`;
app.post(addReviewPath, (req: Request, res: Response) => {
    res.status(200);
    res.send(`GET ${addReviewPath} received`);
});

const modifyReviewPath = `${Api.ReviewPath}/modify`;
app.post(`${modifyReviewPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`GET ${modifyReviewPath} received`);
});

const removeReviewPath = `${Api.ReviewPath}/remove`; 
app.post(`${removeReviewPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${removeReviewPath} received`);
});

const addPhotoPath = `${Api.PhotoPath}/add`
app.post(addPhotoPath, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${addPhotoPath} received`);
});

const removePhotoPath = `${Api.PhotoPath}/remove`;
app.post(`${removePhotoPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${removePhotoPath} received`);
});

const modifyPhotoPath = `${Api.PhotoPath}/modify`;
app.post(`${modifyPhotoPath}/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${modifyPhotoPath} received`);
});

const addUserPath = `${Api.UserPath}/add`;
app.post(addUserPath, (req: Request, res: Response) => {
    console.log(`POST ${addUserPath} received`);
    res.status(200);
    const body = req.body;
    res.json(req.body);
    const userType: string = req.body["isBusinessOwner"] ? "businessOwner" : "user";
    const newUser:User = new User(1, req.body["email"], req.body["password"], userType);
    console.log(newUser);
});

const userLoginPath = `${Api.UserPath}/login`;
app.post(userLoginPath, (req: Request, res: Response) => {
    console.log(`GET ${userLoginPath} received`);
    res.status(200);
});

const userBusinessesPath = `${Api.UserPath}/businesses`
app.get(userBusinessesPath, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${Api.UserPath}/businesses received`);
});

const userReviewsPath = `${Api.UserPath}/reviews`
app.get(userReviewsPath, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${Api.UserPath}/reviews received`);
});

const userPhotosPath = `${Api.UserPath}/photos`;
app.get(userPhotosPath, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${Api.UserPath}/photos received`);
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}, or 172.31.47.53:${port} remotely`);
});