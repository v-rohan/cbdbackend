import { getManager, getRepository } from "typeorm";
import { NextFunction, Request, Response, Express } from "express";
import { User, UserRole, Verify } from "../entity/User";
import { msg91_apikey, secretOrKey } from "../config";
import { IGetUserAuthInfoRequest } from "../types";
import { generateLink, passowrdhasher } from "../services";
import { BonusTxn } from "../entity/Transactions/BonusTxn";
import { AdminCheck } from "../middleware/AuthMiddleware";
import multer = require("multer");
import fetch from "node-fetch";
import { publishMail } from "../tasks/publishMail";

var bcrypt = require("bcryptjs");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");

module.exports = (app: Express, passport, sendotp) => {
    require("../passport/jwt")(passport);
    require("../passport/google")(passport);

    // Storage configuration for image files
    const storage = multer.diskStorage({
        destination: (req: Request, file: any, cb: any) => {
            cb(null, "./media/users/");
        },
        filename: (req: Request, file: any, cb: any) => {
            cb(
                null,
                file.originalname
                    .replace(new RegExp(" ", "g"), "-")
                    .substring(0, file.originalname.length - 4) +
                    "-" +
                    Date.now() +
                    file.originalname.substring(
                        file.originalname.length - 4,
                        file.originalname.length
                    )
            );
        },
    });
    const upload = multer({ storage: storage });

    app.post("/updateuser", 
        passport.authenticate("jwt", { session: false }),
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            var user = await getRepository(User).findOne({
                where: {id: req.user.id}
            })
            user = { ...user, ...req.body };
            await getRepository(User).save(user).then(() => {
                return res.status(200).json(user);
            })
        }
    )

    app.post("/edituser",
        passport.authenticate("jwt", { session: false }),
        upload.single("image"),
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            console.log(req.file);
            var user = await getRepository(User).findOne({
                where: {id: req.user.id}
            })
            if (req.file) {
                user.image = req.file.path
                await getRepository(User).save(user).then(() => {
                    res.status(200).json(user);
                });
            } else {
                return res.sendStatus(400);
            }
        }
    )

    app.get("/verifymail/:hash",
    async (req: Request, res: Response) => {
        var hash = req.params.hash;
        var verify: Verify;
        try {
            verify = await getRepository(Verify).findOneOrFail({
                where: {verify_hash: hash},
                relations: ["user"]
            })
        } catch (err) {
            return res.status(400).json("Wrong Verify String provided")
        }
        if (verify) {
            await getRepository(User).update(verify.user.id, {
                    is_email_verified: true,
                    email_verified_at: new Date()
                })
            return res.status(200).json("Email Verified");
        }
        return res.status(400).json("Wrong Verify String provided");
    })

    app.get('/sendotp/:mob',
    passport.authenticate("jwt", { session: false }),
    async (req: IGetUserAuthInfoRequest, res: Response) => {
        var mob = req.params.mob;
        if (mob.length === 10) {
            mob = "91" + mob;
        }

        const otpsent = await fetch(`https://api.msg91.com/api/v5/otp?template_id=5fd5ba69644eaa49af6dd21c&mobile=${mob}&authkey=${msg91_apikey}&otp_length=6`)

        if (otpsent) {
            var jsondata = await otpsent.json();
            if (jsondata.type === 'success') {
                return res.status(200).json({"message": "OTP Sent"});
            } else {
                return res.status(400).json({"message": "Couldn't send OTP"});
            }
        }
        return res.status(400).json({"message": "Couldn't send OTP"});
    })

    app.get('/resendotp/:mob',
    passport.authenticate("jwt", {session: false}),
    async (req: IGetUserAuthInfoRequest, res: Response) => {
        var mob = req.params.mob;
        if (mob.length === 10) {
            mob = "91" + mob;
        }

        const resendotp = await fetch(`https://api.msg91.com/api/v5/otp/retry?authkey=${msg91_apikey}&retrytype=text&mobile=${mob}`)

        if (resendotp) {
            var jsondata = await resendotp.json();
            if (jsondata.type === 'success') {
                return res.status(200).json({"message": "OTP Resent"})
            } else {
                return res.status(400).json({"message": "Couldn't resend OTP"})
            }
        }
        return res.status(400).json({"message": "Couldn't resend OTP"})
    })

    app.post('/verifyotp',
    passport.authenticate("jwt", {session: false}),
    async (req: IGetUserAuthInfoRequest, res: Response) => {
        var mob = req.body.mob;
        if (mob.length === 10) {
            mob = "91" + mob;
        }
        var otp = req.body.otp; 
        
        const verifyotp = await fetch(`https://api.msg91.com/api/v5/otp/verify?authkey=${msg91_apikey}&mobile=${mob}&otp=${otp}`)

        if (verifyotp) {
            var jsondata = await verifyotp.json();
            if (jsondata.type === 'success') {
                await getRepository(User).update(req.user.id, {
                    is_mobile_verified: true,
                    mobile_verified_at: new Date(),
                })
                return res.status(200).json({"message": "OTP Verified"})
            } else {
                return res.status(400).json({"message": "Couldn't verify OTP"})
            }
        }
        return res.status(400).json({"message": "Couldn't verify OTP"})
    })

    //signup
    app.post(
        "/register",
        async (request: Request, response: Response, next: NextFunction) => {
            var newUser = new User();
            var bonus = new BonusTxn();
            newUser.referralLink = generateLink();
            bonus.amount = 25;
            newUser.email = request.body.email;
            // newUser.role = UserRole.ADMIN;
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

                        bonus2.referred = newUser;

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
                    .then(async () => {
                        publishMail({
                            template: 'welcome',
                            message: {
                                to: newUser.email.toString(),
                            },
                            locals: {
                                first_name: newUser.first_name,
                                last_name: newUser.last_name,
                            },
                        })
                        var hash = crypto.createHash('sha256').update(newUser.email).digest('hex');
                        var verify = new Verify();
                        verify.user = newUser;
                        verify.verify_hash = hash;
                        try {
                            await getRepository(Verify).save(verify);
                        } catch (err) {
                            console.error(err);
                            return;
                        }
                        publishMail({
                            template: 'verifyemail',
                            message: {
                                to: newUser.email.toString(),
                            },
                            locals: {
                                first_name: newUser.first_name,
                                last_name: newUser.last_name,
                                verify_link: `${process.env.BACKEND_URL}/verifymail/${verify.verify_hash}/`,
                            },
                        })
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

    app.post("/googleapp", async (request: Request, response: Response) => {
        try {
            const res = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" +
                    request.body.accessToken
            );
            const data: any = await res.json();
            await getRepository(User)
                .findOne({ email: data.email })
                .then(async (user) => {
                    if (user) {
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
                    } else {
                        user = new User();
                        user.email = data.email;
                        user.password = data.sub;
                        user.referralLink = generateLink();
                        user.is_email_verified = true;

                        getRepository(User)
                            .save(user)
                            .then(async (savedUser) => {
                                const payload = {
                                    id: savedUser.id,
                                    email: savedUser.email,
                                    role: savedUser.role,
                                };

                                var token = jwt.sign(payload, secretOrKey, {
                                    expiresIn: 600000,
                                });

                                response.status(200).json({
                                    token: "Bearer " + token,
                                });
                            });
                    }
                })
                .catch((error) => {
                    response.status(500).send(error);
                });


            } catch (error) {
            console.log(error);
            response.sendStatus(403);
        }
    });

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
                        users.forEach((item)=> delete item['password'])
                        response.status(200).json(users);
                    })
                    .catch((error) => {
                        response.status(500).send(error);
                    });
            } else {
                var user = await getRepository(User).findOneOrFail({where: {id: request.user.id}})
                if (!user.image) {
                    user.image = 'media/users/defimg.png'
                }
                response.status(200).json(user);
            }
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

    app.get(
        "/verify/:link",
        passport.authenticate("jwt", { session: false }),
        async (req: IGetUserAuthInfoRequest, res: Response) => {
            const link = req.params.link;
            try {
                const user = await getRepository(User).findOneOrFail({
                    where: { referralLink: link },
                });
                if (user === req.user) {
                    user.is_email_verified = true;
                    await getRepository(User).save(user);
                    res.sendStatus(200);
                } else res.sendStatus(403);
            } catch (err) {
                res.sendStatus(400);
            }
        }
    );
};
