import { Engine } from '@/engine'
import * as Dictionnary from './dictionary'
import { getRandomInt } from './math'

const BLUE = 'blue'
const RED = 'red'

const TEAM_COLORS = [BLUE, RED]

const chooseWhoBegin = () => {
  if (Math.random() < 0.5) {
    return BLUE
  } else {
    return RED
  }
}

const totalCards = 25
const beginnerCardsNumber = 9
const otherCardsNumber = 8

const generateRandomCards = (beginner, murderer) => {
  const blue = []
  const red = []
  let index = getRandomInt(0, totalCards)
  while (blue.length + red.length < beginnerCardsNumber + otherCardsNumber) {
    const blueOk =
      blue.length ===
      (beginner === BLUE ? beginnerCardsNumber : otherCardsNumber)
    const isMurderer = murderer === index
    const isInBlue = blue.includes(index)
    const isInRed = red.includes(index)
    if (isMurderer || isInBlue || isInRed) {
      index = (index + 1) % totalCards
    } else {
      if (blueOk) {
        red.push(index)
      } else {
        blue.push(index)
      }
      index = getRandomInt(0, totalCards)
    }
  }
  return { blue, red }
}

const init = locale => {
  const cards = Dictionnary.random(totalCards, locale)
  const beginner = chooseWhoBegin()
  const murderer = getRandomInt(0, totalCards)
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

const filter = (state, player, players) => {
  if (player.spy) {
    return { ...state, players }
  } else {
    const newState = { ...state, players }
    delete newState.blue
    delete newState.red
    delete newState.murderer
    return newState
  }
}

const otherColor = color => {
  if (TEAM_COLORS.includes(color)) {
    if (color === BLUE) {
      return RED
    } else {
      return BLUE
    }
  } else {
    return null
  }
}

const selectFoundByColor = color => {
  if (color === BLUE) {
    return 'foundBlue'
  } else {
    return 'foundRed'
  }
}

const allFound = (founded, cards) => {
  if (cards.length === 0) {
    return true
  } else {
    const [card, ...others] = cards
    if (founded.includes(card)) {
      return allFound(founded, others)
    } else {
      return false
    }
  }
}

const correctAnswer = (state, player, cardNumber) => {
  const otherTeam = otherColor(player.team)
  const numberToGuess = state.numberToGuess - 1
  const isOtherTurn = numberToGuess === 0
  const foundColor = selectFoundByColor(player.team)
  const newFounded = [...state[foundColor], cardNumber]
  const winner = allFound(newFounded, state[player.team]) ? player.team : null
  return {
    ...state,
    [foundColor]: newFounded,
    numberToGuess,
    canPass: true,
    turn: isOtherTurn ? otherTeam : state.turn,
    spyToTalk: isOtherTurn ? true : false,
    winner,
  }
}

const opponentAnswer = (state, player, cardNumber) => {
  const otherTeam = otherColor(player.team)
  const foundColor = selectFoundByColor(otherTeam)
  const newFounded = [...state[foundColor], cardNumber]
  const winner = allFound(newFounded, state[otherTeam]) ? otherTeam : null
  return {
    ...state,
    [foundColor]: newFounded,
    turn: otherTeam,
    spyToTalk: true,
    winner,
  }
}

const murdererAnswer = (state, player, cardNumber) => {
  const otherTeam = otherColor(player.team)
  return {
    ...state,
    winner: otherTeam,
    foundMurderer: cardNumber,
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

const canGuess = (state, player, cardNumber) => {
  const { spyToTalk, turn } = state
  const { spy, team } = player
  const found = isFound(state, cardNumber)
  return !spyToTalk && !spy && turn === team && found
}

const guess = (state, player, { cardNumber }) => {
  if (canGuess(state, player, cardNumber)) {
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

const canPass = (state, player) => {
  const { turn, canPass } = state
  const { team, spy } = player
  return !spy && turn === team && canPass
}

const pass = (state, player) => {
  if (canPass(state, player)) {
    return { ...state, turn: otherColor(player.team), spyToTalk: true }
  }
  return state
}

const canTalk = (state, player) => {
  const { spyToTalk, turn } = state
  const { spy, team } = player
  return spyToTalk && spy && turn === team
}

const talk = (state, player, { hint, numberToGuess }) => {
  if (canTalk(state, player)) {
    return {
      ...state,
      spyToTalk: false,
      numberToGuess: numberToGuess + 1,
      hint,
      canPass: false,
    }
  }
  return state
}

const CodeNamesEngine = (players, locale, previousState) => {
  const state = previousState || init(locale)
  return Engine({ state, players, filter, actions: { guess, pass, talk } })
}

export default CodeNamesEngine
export { CodeNamesEngine, otherColor, BLUE, RED, TEAM_COLORS }
