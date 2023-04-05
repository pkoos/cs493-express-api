import express, { Express, Request, Response, application } from 'express';
import bodyParser from 'body-parser';
import {Business} from "./models/business";
import {Api} from './models/api';

const app: Express = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post(`${Api.BusinessPath}/add`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${Api.BusinessPath}/add received`);
});

app.post(`${Api.BusinessPath}/modify/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${Api.BusinessPath}/modify received`);
});

app.post(`${Api.BusinessPath}/remove/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${Api.BusinessPath}/remove received`);
});

app.get(`${Api.BusinessPath}es`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`GET ${Api.BusinessPath}es received`);
});

app.post(`${Api.ReviewPath}/new`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`GET ${Api.ReviewPath}/new received`);
});

app.post(`${Api.ReviewPath}/modify/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`GET ${Api.ReviewPath}/modify received`);
});

app.post(`${Api.ReviewPath}/delete/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${Api.ReviewPath}/delete received`);
});

app.post(`${Api.PhotoPath}/upload`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${Api.PhotoPath}/upload received`);
});

app.post(`${Api.PhotoPath}/delete/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${Api.PhotoPath}/delete received`);
});

app.post(`${Api.PhotoPath}/modify/:id`, (req: Request, res: Response) => {
    res.status(200);
    res.send(`POST ${Api.PhotoPath}/modify received`);
});

app.post(`${Api.UserPath}/create`, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${Api.UserPath}/create received`);
});

app.post(`${Api.UserPath}/login`, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${Api.UserPath}/login received`);
});

app.get(`${Api.UserPath}/businesses`, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${Api.UserPath}/businesses received`);
});

app.get(`${Api.UserPath}/reviews`, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${Api.UserPath}/reviews received`);
});

app.get(`${Api.UserPath}/photos`, (req: Request, res: Response) => {     res.status(200);
    res.status(200);
    res.send(`GET ${Api.UserPath}/photos received`);
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});