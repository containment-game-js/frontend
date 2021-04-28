import io from 'socket.io-client'
import { socketURL } from '@/services/backend'

const connect = () => {
  const url = socketURL()
  const socket = io(url)
  return socket
}

let socket = connect()

const reconnect = () => {
  socket.disconnect()
  socket = connect()
}

export { socket, reconnect }
