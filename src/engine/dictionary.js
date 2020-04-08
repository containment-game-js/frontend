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

const selectFinalLocale = locale => {
  if (Object.keys(words).includes(locale)) {
    return locale
  } else {
    return 'en'
  }
}

const random = (howMuch = 1, locale, got = [], foundWords = []) => {
  const finalLocale = selectFinalLocale(locale)
  const index = getNextInt(words[finalLocale], got)
  if (howMuch < 2) {
    return [...foundWords, words[finalLocale][index]]
  } else {
    return random(
      howMuch - 1,
      finalLocale,
      [...got, index],
      [...foundWords, words[finalLocale][index]]
    )
  }
}

export { random }
