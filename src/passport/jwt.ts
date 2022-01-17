import { getRepository } from 'typeorm';
import { secretOrKey } from '../config'
import { StrategyOptions, ExtractJwt, Strategy } from 'passport-jwt'
import { User } from "../entity/User";

var opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secretOrKey
}
module.exports = function (passport) {

passport.use(new Strategy(opts, function (jwt_payload, done) {
    getRepository(User).findOne({ id: jwt_payload.id }).then(user => {
        return done(null, user);
    }).catch(err => {
        return done(err, false);

    })

}));
}