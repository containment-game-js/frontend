import { getRandomInt } from '../math'

const lower = s => {
  return s.toLowerCase().trim()
}

class Dictionary {
  constructor(words) {
    const finalWords = words.map(s => s.toLowerCase().trim())
    this.words = new Set(finalWords)
    this.actualWords = [...this.words]
  }

  get length() {
    return this.words.size
  }

  addWords(words) {
    words.map(lower).forEach(t => {
      this.words.add(t)
    })
    this.actualWords = [...this.words]
  }

  removeWords(words) {
    words.map(lower).forEach(t => {
      this.words.delete(t)
    })
    this.actualWords = [...this.words]
  }

  removeFromActualWords(index) {
    this.actualWords.splice(index, 1)
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
