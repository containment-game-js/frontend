const app = require('express')()
const server = require('http').Server(app)
const p2pserver = require('socket.io-p2p-server').Server
const uuidv4 = require('uuid').v4
const io = require('socket.io')(server)
const faker = require('faker')

// app.use(express.static(__dirname))
app.get('/', function(req, res) {
  res.send(roomsToString());
});
// io.use(p2pserver)

const rooms = {}

const roomsToString = () => JSON.stringify(Object.values(rooms).map(room => ({
  ...room,
  host: null,
  players: room.players.map(player => ({
    name: player.name
  }))
})))

const createRoom = ({
  socket,
  io
}) => (name) => {
  const rid = uuidv4()
  const roomName = faker.hacker.noun()
  rooms[rid] = {
    id: rid,
    host: socket,
    name: roomName,
    players: [{
      socket,
      name
    }]
  }
  dispatchRooms(io)
  socket.emit('create-room', rid)
}

const enterRoom = ({
  socket,
  io
}) => ({
  rid,
  name
}) => {
  if (!(rooms[rid].players.find(p => p.socket === socket))) {
    rooms[rid].players.push({
      socket,
      name
    })
    dispatchRooms(io)
  }
}

const dispatchRooms = (socket) => socket.emit('rooms', Object.values(rooms).map(room => ({
  ...room,
  host: null,
  players: room.players.map(player => ({
    name: player.name
  }))
})))

io.on('connection', function(socket) {

  dispatchRooms(socket)

  socket.on('enter-room', enterRoom({
    socket,
    io
  }))

  socket.on('create-room', createRoom({
    socket,
    io
  }))

  socket.on('get-rooms', () => dispatchRooms(socket))

  // socket.on('peer-msg', function(data) {
  //   console.log('Message from peer: %s', data);
  //   socket.broadcast.emit('peer-msg', data);
  // })
  //
  // socket.on('go-private', function(data) {
  //   console.log('private')
  //   socket.broadcast.emit('go-private', data);
  // });
});

server.listen(3030, function() {
  console.log("Listening on 3030")
})
