
import {Request, Response} from 'express';

export function genericErrorResponse(res: Response, statusCode: number, message: string): void {
    res.status(statusCode).json({
        "status": "error",
        "message": message
    });
}

export function errorNotFound(res: Response, type:string) {
    genericErrorResponse(res, 404, `${type} not found.`);
}

export function errorNoModify(res: Response, type: string) {
    genericErrorResponse(res, 401, `Cannot modify a ${type} you did not create.`);
}

export function errorNoRemove(res: Response, type: string) {
    genericErrorResponse(res, 401, `Cannot remove a ${type} you did not create.`);
}

export function errorInvalidBody(res: Response) {
    genericErrorResponse(res, 406, "Invalid request body.");
}

export function errorInvalidModification(res: Response, type: string) {
    genericErrorResponse(res, 403, `Modified ${type} is not valid.`);
}

export function errorInvalidQuery(res: Response) {
    genericErrorResponse(res, 406, "ownerId missing from query string.");
}

export function successResponse(res: Response, successDetails: Object) {
    const success_json = {
        "status": "success"
    };

    Object.assign(success_json, successDetails);
    
    res.status(200).json(success_json);
}

export function errorInvalidCredentials(res: Response) {
    genericErrorResponse(res, 500, "Error logging in.");
}

export function errorInvalidToken(res: Response) {
    genericErrorResponse(res, 401, "Invalid authentication token provided.");
}
