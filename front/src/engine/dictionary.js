import {getRandomInt} from './math'
const words = ['éléphant', 'hippopotame']

const random = () => words[getRandomInt(0, words.length)]

export {
  random
}
