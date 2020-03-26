import {getRandomInt} from './math'
const words = require('../assets/dictionnary.json')

const random = () => words[getRandomInt(0, words.length)]

export {
  random
}
