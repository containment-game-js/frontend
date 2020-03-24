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
  const blue = []
  const red = []
  let index = getRandomInt(0, 30)
  while (blue.length + red.length !== 17) {
    const cond =
      murderer === index || blue.includes(index) || red.includes(index)
    if (cond) {
      index += 1
      continue
    } else {
      if (blueOk) {
        red.push(index)
      } else {
        blue.push(index)
        if (beginner === 'blue' && blue.length === 9) {
          blueOk = true
        } else if (beginner === 'red' && blue.length === 8) {
          blueOk = true
        }
      }
      index = getRandomInt(0, 30)
    }
  }
  return { blue, red }
}

const init = () => {
  const cards = new Array(30).fill(0).map(() => Dictionnary.random())
  const beginner = chooseWhoBegin()
  const murderer = getRandomInt(0, 30)
  const { blue, red } = generateRandomCards(beginner, murderer)
  return {
    cards,
    murderer,
    beginner,
    foundBlue: [],
    foundRed: [],
    foundNeutral: [],
    winner: null,
    blue,
    red,
    turn: beginner,
    spyToTalk: true,
    hint: null,
    numberToGuess: null,
    canPass: false,
  }
}

const filter = (state, player) => {
  if (player.spy) {
    return state
  } else {
    const newState = { ...state }
    delete newState.blue
    delete newState.red
    delete newState.murderer
    return newState
  }
}

const otherColor = (color) => {
  if (color === 'blue') {
    return 'red'
  } else {
    return 'blue'
  }
}

const selectFoundByColor = (color) => {
  if (color === 'blue') {
    return 'foundBlue'
  } else {
    return 'foundRed'
  }
}

const correctAnswer = (state, player, cardNumber) => {
  const otherTeam = otherColor(player.team)
  const numberToGuess = state.numberToGuess - 1
  const isOtherTurn = numberToGuess === 0
  const foundColor = selectFoundByColor(player.team)
  return {
    ...state,
    [foundColor]: [...state[foundColor], cardNumber],
    numberToGuess,
    canPass: true,
    turn: isOtherTurn ? otherTeam : state.turn,
    spyToTalk: isOtherTurn ? true : false,
  }
}

const opponentAnswer = (state, player, cardNumber) => {
  const otherTeam = otherColor(player.team)
  const foundColor = selectFoundByColor(otherTeam)
  return {
    ...state,
    [foundColor]: [...state[foundColor], cardNumber],
    turn: otherTeam,
    spyToTalk: true,
  }
}

const murdererAnswer = (state, player, cardNumber) => {
  const otherTeam = otherColor(player.team)
  return {
    ...state,
    win: otherTeam,
  }
}

const neutralAnswer = (state, player, cardNumber) => {
  const otherTeam = otherColor(player.team)
  return {
    ...state,
    foundNeutral: [...state.foundNeutral, cardNumber],
    turn: otherTeam,
    spyToTalk: true,
  }
}

const isFound = (state, cardNumber) => {
  const { foundRed, foundBlue, foundNeutral } = state
  return (
    !foundRed.includes(cardNumber) &&
    !foundBlue.includes(cardNumber) &&
    !foundNeutral.includes(cardNumber)
  )
}

const canGuess = (state, player) => {
  const { spyToTalk, turn } = state
  const { spy, team } = player
  const found = isFound(state, cardNumber)
  return !spyToTalk && !spy && turn === team && found
}

const guess = (state, player, { cardNumber }) => {
  if (canGuess(state, player)) {
    const otherTeam = otherColor(player.team)
    if (state[player.team].includes(cardNumber)) {
      return correctAnswer(state, player, cardNumber)
    } else if (state[otherTeam].includes(cardNumber)) {
      return opponentAnswer(state, player, cardNumber)
    } else if (cardNumber === state.murderer) {
      return murdererAnswer(state, player, cardNumber)
    } else {
      return neutralAnswer(state, player, cardNumber)
    }
  }
  return state
}

const actions = {
  guess,
}

const CodeNamesEngine = (players) => {
  const state = init()
  return Engine({ state, players, filter, actions })
}

export { CodeNamesEngine }
