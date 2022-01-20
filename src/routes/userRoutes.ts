import { getRepository } from "typeorm";
import { NextFunction, Request, Response, Express } from "express";
import { User } from "../entity/User";
import { secretOrKey } from "../config";
import { IGetUserAuthInfoRequest } from "../types";


var jwt = require("jsonwebtoken");

var bcrypt = require('bcryptjs');

module.exports = (app: Express, passport) => {

    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    //signup
    app.post('/register', async (request: Request, response: Response, next: NextFunction) => {
        var newUser = new User();
        newUser.email = request.body.email;
        await bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(request.body.password, salt, function (err, hash) {
                newUser.password = hash;
                //  console.log(newUser.password);
                getRepository(User).save(newUser).then(user => {
                    response.status(201).send(user);
                }).catch(error => {
                    if (error)
                        response.status(400).send(error);
                })
            });
        })

    })

    app.post('/login', async (request: Request, response: Response, next: NextFunction) => {
        var email = request.body.email;
        var password = request.body.password;
        try {
            var user = await getRepository(User).findOne({ email: email });
            console.log(user);
            bcrypt.compare(password, user.password, function (err, result) {
                if (result) {
                    const payload = {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    };

                    var token = jwt.sign(payload, secretOrKey, {
                        expiresIn: 600000,
                    });

                    response.status(200).json({
                        token: "Bearer " + token,
                    })
                } else response.status(403).send("Invalid email or password");

            })
        }
        catch (error) {
            response.status(500).send(error);
        }

    })

    app.get(
        "/google",
        passport.authenticate("google", {
            scope: ["email", "profile"],
        })
    );

    app.get(
        "/google/callback",
        passport.authenticate("google"),
        (request: IGetUserAuthInfoRequest, response: Response) => {
            const payload = {
                id: request.user.id,
                email: request.user.email,
                role: request.user.role,
            };
            var token = jwt.sign(payload, secretOrKey, { expiresIn: 600000 });
            response.status(200).json({
                token: "Bearer " + token,
            })

        })

    app.get('/user', passport.authenticate("jwt", { session: false }), (request: IGetUserAuthInfoRequest, response: Response) => {
        response.status(200).json(request.user);
    })

}