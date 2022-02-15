import { NextFunction, Response } from "express";
import { IGetUserAuthInfoRequest } from "../types";

const AdminCheck = (
    request: IGetUserAuthInfoRequest,
    response: Response,
    next: NextFunction
) => {
    if (request.isAuthenticated() && request.user.role === "admin") {
        next();
    } else {
        response.status(401).send("Unauthorized");
    }
};

export default AdminCheck;
