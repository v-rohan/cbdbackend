require('dotenv').config();

export const port = process.env.PORT || 3000;
export const secretOrKey = process.env.SECRET_OR_KEY || 'test';
