import { getManager, getRepository } from "typeorm";
import { NextFunction, Request, Response, Express } from "express";
import { User, UserRole } from "../entity/User";
import { secretOrKey } from "../config";
import { IGetUserAuthInfoRequest } from "../types";
import { generateLink, passowrdhasher } from "../services";
import { BonusTxn } from "../entity/Transactions/BonusTxn";
import AdminCheck from "../middleware/AdminCheck";

var jwt = require("jsonwebtoken");

var bcrypt = require("bcryptjs");

module.exports = (app: Express, passport) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    //signup
    app.post(
        "/register",
        async (request: Request, response: Response, next: NextFunction) => {
            var newUser = new User();
            var bonus = new BonusTxn();
            newUser.referralLink = generateLink();
            bonus.amount = 25;
            newUser.email = request.body.email;
            newUser.role = UserRole.ADMIN;
            try {
                var bonus2 = new BonusTxn();
                bonus2.amount = 25;
                bonus2.expires_on = new Date(
                    new Date().getTime() + 60 * 60 * 24 * 1000 * 90
                );
                bonus2.bonus_code = "refer_bonus";
                if (request.body.ref) {
                    bonus2.user = await getRepository(User).findOneOrFail({
                        referralLink: request.body.ref,
                    });
                    newUser.referralUser = bonus2.user.id;
                }
                newUser.password = await passowrdhasher(request.body.password);
                await getManager()
                    .transaction(async (transactionalEntityManager) => {
                        await transactionalEntityManager
                            .save(newUser)
                            .then((user) => {
                                bonus.user = user;
                            })
                            .catch((error) => {
                                throw error;
                            });

                        if (request.body.ref) {
                            bonus.bonus_code = "join_with_refer";
                            await transactionalEntityManager.save(bonus2);
                        } else {
                            bonus.bonus_code = "join_no_refer";
                        }

                        bonus.expires_on = new Date(
                            new Date().getTime() + 90 * 60 * 60 * 24 * 1000
                        );
                        await transactionalEntityManager
                            .save(bonus)
                            .catch((error) => {
                                throw error;
                            });
                    })
                    .then(() => {
                        response.sendStatus(200);
                    })
                    .catch((error) => {
                        throw error;
                    });
            } catch (error) {
                console.log(error);
                response.status(400).send(error);
            }
        }
    );

    app.post(
        "/login",
        async (request: Request, response: Response, next: NextFunction) => {
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
                        });
                    } else response.status(403).send("Invalid email or password");
                });
            } catch (error) {
                response.status(500).send(error);
            }
        }
    );

    app.post(
        "/adminLogin",
        async (request: Request, response: Response, next: NextFunction) => {
            var email = request.body.email;
            var password = request.body.password;
            try {
                var user = await getRepository(User).findOne({ email: email });
                console.log(user);
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result && user.role == UserRole.ADMIN) {
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
                        });
                    } else if (result) {
                        response.status(403).send("User not an admin");
                    } else
                        response.status(403).send("Invalid email or password");
                });
            } catch (error) {
                response.status(500).send(error);
            }
        }
    );

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

            var token = jwt.sign(payload, secretOrKey, {
                expiresIn: 600000,
            });

            response.status(200).json({
                token: "Bearer " + token,
            });
        }
    );

    app.get(
        "/user",
        passport.authenticate("jwt", { session: false }),
        async (
            request: IGetUserAuthInfoRequest,
            response: Response,
            next: NextFunction
        ) => {
            if (request.user.role === UserRole.ADMIN) {
                await getRepository(User)
                    .find()
                    .then((users) => {
                        response.status(200).json(users);
                    })
                    .catch((error) => {
                        response.status(500).send(error);
                    });
            } else response.status(200).json(request.user);
            response.status(200).json(request.user);
        }
    );

    app.post(
        "/user/createAdmin",
        passport.authenticate("jwt", { session: false }),
        AdminCheck,
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            const id = req.body.id;
            try {
                const user = await getRepository(User).findOneOrFail({
                    where: { id: Number(id) },
                });
                user.role = UserRole.ADMIN;
                await getRepository(User).save(user);
                return res.status(204).json({ message: "Action Successful" });
            } catch (err) {
                return res.status(400).json({
                    message: `Failed to find user with id: ${req.body.id}`,
                });
            }
        }
    );
};
