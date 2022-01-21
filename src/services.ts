import { customRandom, random, urlAlphabet } from 'nanoid'
const nanoid = customRandom(urlAlphabet, 10, random)

export const generateLink = () => {
    var ret = nanoid()
    console.log(ret)
    return ret
}

