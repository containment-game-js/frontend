import io from 'socket.io-client'
import P2P from 'socket.io-p2p'

const connectionURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3030/'
  } else {
    return 'https://containment-game.herokuapp.com/'
  }
}

const connect = () => {
  const url = connectionURL()
  const socket = new P2P(io(url, { autoUpgrade: false }))
  socket.on('peer-msg', console.log)
  return socket
}

let socket = connect()

const reconnect = () => {
  socket.disconnect()
  socket = connect()
}

export { socket, reconnect }
