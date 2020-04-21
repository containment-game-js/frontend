import * as localesWords from './dictionaries'

const selectFinalLocale = locale => {
  if (Object.keys(localesWords).includes(locale)) {
    return locale
  } else {
    return 'en'
  }
}

const random = (howMuch = 1, locale) => {
  const finalLocale = selectFinalLocale(locale)
  const words = localesWords[finalLocale]
  return words.random(howMuch)
}

export { random }
