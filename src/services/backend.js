const connectionURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3030'
  } else {
    return 'https://containment-game.herokuapp.com'
  }
}

export { connectionURL }
