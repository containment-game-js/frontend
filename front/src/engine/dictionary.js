import {getRandomInt} from './math'
const words = require('../assets/dictionary.json')

const random = () => words[getRandomInt(0, words.length)]

export {
  random
}
