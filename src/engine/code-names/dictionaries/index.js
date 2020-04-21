import Dictionary from './Dictionary'
import frWords from './fr-dictionary'
import enWords from './en-dictionary'

const fr = new Dictionary(frWords)
const en = new Dictionary(enWords)

export { fr, en }
