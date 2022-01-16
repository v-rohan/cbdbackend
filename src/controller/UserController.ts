import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
var bcrypt = require('bcryptjs');

export class UserController {

    private userRepository = getRepository(User);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.findOne(request.params.id);
    }

    //signup
    async save(request: Request, response: Response, next: NextFunction) {
        var newUser = new User();
        newUser.email = request.body.email;
        newUser.username = request.body.username;
        try {
            await bcrypt.genSalt(10, function (err, salt) {
                if (err) throw err;
                else {
                    bcrypt.hash(request.body.password, salt, function (err, hash) {
                        if (err) throw err;
                        else {
                            newUser.password = hash;
                            console.log(newUser.password);
                        }
                    });
                }
            })
            this.userRepository.save(newUser);
        }
        catch (err) {
            console.log(err);
        }
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.userRepository.findOne(request.params.id);
        await this.userRepository.remove(userToRemove);
    }

}