require('dotenv').config();

export const port = process.env.PORT || 3000;
export const secretOrKey = process.env.SECRET_OR_KEY || 'test';
export const callbackURL = process.env.GOOGLE_CALLBACK;
export const clientID = process.env.GOOGLE_OAUTH_CLIENT_ID;
export const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
export const amqp = process.env.RBMQ_HOST;
export const queue = 'nodemailer-amqp';
export const mailer_pass = process.env.MAILER_PASS;
