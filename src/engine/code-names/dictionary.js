import { getRandomInt } from './math'
import frWords from './fr-dictionary.json'
import enWords from './en-dictionary.json'

const localesWords = {
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
  if (Object.keys(localesWords).includes(locale)) {
    return locale
  } else {
    return 'en'
  }
}

const random = (howMuch = 1, locale, got = [], foundWords = []) => {
  const finalLocale = selectFinalLocale(locale)
  const words = localesWords[finalLocale]
  const index = getNextInt(words, got)
  const newRandoms = [...foundWords, words[index]]
  if (howMuch < 2) {
    return newRandoms
  } else {
    const newGot = [...got, index]
    return random(howMuch - 1, finalLocale, newGot, newRandoms)
  }
}

export { random }
