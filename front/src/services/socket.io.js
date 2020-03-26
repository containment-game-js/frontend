import io from 'socket.io-client'
import P2P from 'socket.io-p2p'

const connect = () => {
  return new P2P(io('https://containment-game.herokuapp.com/'), { autoUpgrade: false })
}

let socket = connect()

const reconnect = () => {
  socket.disconnect()
  socket = connect()
}

export { socket, reconnect }
