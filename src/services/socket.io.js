import io from 'socket.io-client'
import P2P from 'socket.io-p2p'
import { connectionURL } from '@/services/backend'

const connect = () => {
  const url = connectionURL()
  const socket = new P2P(io(url, { autoUpgrade: false }, console.log))
  console.log(socket);
  socket.on('peer-msg', content => console.log('peer-msg', content))
  socket.on('action', value => console.log('action:', value))
  socket.on('create-room', value => console.log('create-room:', value))
  return socket
}

let socket = connect()

const reconnect = () => {
  socket.disconnect()
  socket = connect()
}

export { socket, reconnect }
