import { customRandom, random, urlAlphabet } from "nanoid";
const nanoid = customRandom(urlAlphabet, 10, random);
var bcrypt = require("bcryptjs");

export const generateLink = () => {
    var ret = nanoid();
    console.log(ret);
    return ret;
};

export const passowrdhasher = (password: string) => {
    return new Promise<string>(async (resolve) => {
        await bcrypt.genSalt(10, async function (err: Error, salt: string) {
            if (err) throw err;
            await bcrypt.hash(
                password,
                salt,
                async function (err: Error, hash: string) {
                    if (err) {
                        throw err;
                    }
                    resolve(hash);
                }
            );
        });
    });
};
