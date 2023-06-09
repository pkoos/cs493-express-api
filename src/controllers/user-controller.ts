import { Request, Response } from "express";
import { ResultSetHeader } from 'mysql2/promise';
import { compare, hash } from 'bcryptjs';

import * as rh from "./responses-helper";
import { User } from '../models/user';
import { generateAuthToken, db } from "../index";

export async function addUser(req: Request, res: Response) {
    const new_user: User = new User({
        id: -20,
        name: req.body["name"],
        email: req.body["email"],
        admin: false
    });
    const new_hash: string = await hash(req.body["password"], 8);
    new_user.password = new_hash;

    if(!new_user.isValid()) {
        rh.errorInvalidBody(res);
        return;
    }

    const [db_results] = await db.query(User.insertString(), new_user.insertParams());
    new_user.id = (db_results as ResultSetHeader).insertId;
    rh.successResponse(res, {"user": new_user});
}

export async function loginUser(req: Request, res: Response) {
    if(!(req.body["id"] && req.body["password"])) {
        rh.errorInvalidBody(res);
        return;
    }
    const authenticated: boolean = await validateUser(req.body["id"], req.body["password"]);
    if(!authenticated) {
        rh.errorInvalidCredentials(res);
        return;
    }
    rh.successResponse(res, {
        "message": "Logged in.",
        "token": generateAuthToken(req.body["id"])
    });
}

export async function getUserDetails(req: Request, res: Response) {
    const user_id: number = parseInt(req.params.id);
    const user: User = await getUserByID(user_id, true);
    if(!user.isValid()) {
        rh.errorNotFound(res, "User");
        return;
    }

    rh.successResponse(res, {
        "user": user
    });
}

export async function validateUser(id: number, password: string): Promise<boolean> {
    const user: User = await getUserByID(id, false);
    const validated: boolean = await compare(password, user.password);
    return validated;
}

export async function getUserByID(user_id: number, includePassword: boolean): Promise<User> {
    const queryString:string = "SELECT * FROM user WHERE id=?";
    const params: any[] = [user_id];
    const [db_results] = await db.query(queryString, params);
    const db_user: User = (db_results as any[]).length == 0 ? new User() : User.fromDatabase(db_results as any[]);
    if(includePassword) {
        db_user.password = "";
    }
    return db_user;
}
