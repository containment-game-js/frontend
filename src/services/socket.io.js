import io from 'socket.io-client'
import { connectionURL } from '@/services/backend'

const connect = () => {
  const url = connectionURL()
  const socket = io(url)
  return socket
}

let socket = connect()

const reconnect = () => {
  socket.disconnect()
  socket = connect()
}

export { socket, reconnect }
