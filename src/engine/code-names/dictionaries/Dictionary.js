import { getRandomInt } from '../math'

class Dictionary {
  constructor(words) {
    this.words = [...words]
    this.actualWords = [...words]
  }

  removeFromActualWords(index) {
    this.actualWords.splice(index, 0)
    if (this.actualWords.length === 0) {
      this.actualWords = [...this.words]
    }
  }

  random(n, acc = []) {
    if (n === 0) {
      return acc
    } else {
      const index = getRandomInt(0, this.actualWords.length)
      const newAcc = [...acc, this.actualWords[index]]
      this.removeFromActualWords(index)
      return this.random(n - 1, newAcc)
    }
  }
}

export default Dictionary
