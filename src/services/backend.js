const connectionURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3030'
  } else {
    return 'https://api.containment-ga.me'
  }
}

export { connectionURL }
