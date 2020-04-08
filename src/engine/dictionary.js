import { getRandomInt } from './math'
const frWords = require('../assets/fr-dictionary.json')
const enWords = require('../assets/en-dictionary.json')

const words = {
  fr: frWords,
  en: enWords,
}

const getNextInt = (words, got, int) => {
  const index = int || getRandomInt(0, words.length)
  if (got.includes(index)) {
    return getNextInt(words, got, (index + 1) % words.length)
  } else {
    return index
  }
}

const random = (howMuch = 1, locale = 'fr', got = [], foundWords = []) => {
  const index = getNextInt(words[locale], got)
  if (howMuch < 2) {
    return [...foundWords, words[index]]
  } else {
    return random(
      howMuch - 1,
      locale,
      [...got, index],
      [...foundWords, words[locale][index]]
    )
  }
}

export { random }
