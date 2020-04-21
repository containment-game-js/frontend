import Dictionary from './Dictionary'
import frWords from './fr-dictionary'
import enWords from './en-dictionary'

let fr = new Dictionary(frWords)
let en = new Dictionary(enWords)
let none = new Dictionary([])

const update = (locale, words = []) => {
  switch (locale) {
    case 'fr': {
      fr = new Dictionary(frWords)
      fr.addWords(words)
      break
    }
    case 'en': {
      en = new Dictionary(enWords)
      en.addWords(words)
      break
    }
    case 'none': {
      none = new Dictionary([])
      none.addWords(words)
      break
    }
  }
}

export { fr, en, none, update }
