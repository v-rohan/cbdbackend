import { User } from "../entity/User";
import { getRepository } from "typeorm";
import {Profile, Strategy} from 'passport-google-oauth20'; 
import { callbackURL, clientID, clientSecret } from "../config";

module.exports = function (passport) {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    })

    passport.deserializeUser((id, done) => {
        getRepository(User).findOne({ id: id }).then((user) => {
            done(null, user);

        })
    })

    passport.use(new Strategy({
        callbackURL: callbackURL,
        clientID: clientID,
        clientSecret: clientSecret
    }, (_accessToken, _refreshToken, profile: Profile, done) => {
        getRepository(User).findOne({ email: profile.emails[0].value }).then((currentUser) => {
            if (currentUser) {
                console.log('Existing User: ' + currentUser)
                done(null, currentUser);
            }
            else {
                var newUser = new User();
                newUser.email = profile.emails[0].value;
                newUser.password= profile.id;

                getRepository(User).save(newUser).then((newUser) => {
                    console.log(newUser)
                    done(null, newUser)
                })
            }
        })

    }))

}