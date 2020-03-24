import { Engine } from 'engine'
import * as Dictionnary from 'dictionary'

const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

const chooseWhoBegin = () => {
  if (Math.random() < 0.5) {
    return 'blue'
  } else {
    return 'red'
  }
}

const generateRandomCards = (beginner, murderer) => {
  let blueOk = false
  const blueCards = []
  const redCards = []
  let index = getRandomInt(0, 30)
  while (blueCards.length + redCards.length !== 17) {
    const cond =
      murderer === index ||
      blueCards.includes(index) ||
      redCards.includes(index)
    if (cond) {
      index += 1
      continue
    } else {
      if (blueOk) {
        redCards.push(index)
      } else {
        blueCards.push(index)
        if (beginner === 'blue' && blueCards.length === 9) {
          blueOk = true
        } else if (beginner === 'red' && blueCards.length === 8) {
          blueOk = true
        }
      }
      index = getRandomInt(0, 30)
    }
  }
  return { blueCards, redCards }
}

const init = () => {
  const cards = new Array(30).fill(0).map(() => Dictionnary.random())
  const beginner = chooseWhoBegin()
  const murderer = getRandomInt(0, 30)
  const selectedCards = generateRandomCards(beginner, murderer)
  return {
    cards,
  }
}

const CodeNamesEngine = () => {}

export { CodeNamesEngine }
