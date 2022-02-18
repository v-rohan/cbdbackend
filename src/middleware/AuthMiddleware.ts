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

const AdminCheckAllowSafe = (
    request: IGetUserAuthInfoRequest,
    response: Response,
    next: NextFunction
) => {
    if (
        request.method == "GET" || request.method == "OPTIONS" ||
        (request.isAuthenticated() && request.user.role === "admin")
    ) {
        next();
    } else {
        response.status(401).send("Unauthorized");
    }
};

const IsAuthenticated = (
    request: IGetUserAuthInfoRequest,
    response: Response,
    next: NextFunction
) => {
    request.isAuthenticated()
        ? next()
        : response.status(401).send("Unauthorized");
};

export { AdminCheck, AdminCheckAllowSafe, IsAuthenticated };
