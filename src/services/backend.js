const connectionURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000'
  } else {
    return 'https://api.containment-ga.me'
  }
}

const socketURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3030'
  } else {
    return 'https://api.containment-ga.me'
  }
}

export { connectionURL, socketURL }
