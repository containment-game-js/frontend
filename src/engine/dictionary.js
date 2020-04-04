import { getRandomInt } from './math'
const words = require('../assets/dictionary.json')

const getNextInt = (got, int) => {
  const index = int || getRandomInt(0, words.length)
  if (got.includes(index)) {
    return getNextInt(got, (index + 1) % words.length)
  } else {
    return index
  }
}

const random = (howMuch = 1, got = [], foundWords = []) => {
  const index = getNextInt(got)
  if (howMuch < 2) {
    return [...foundWords, words[index]]
  } else {
    return random(howMuch - 1, [...got, index], [...foundWords, words[index]])
  }
}

export { random }
