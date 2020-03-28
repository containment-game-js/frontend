import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router'
import { socket } from '@/services/socket.io'

Vue.use(Vuex)

const cards = [
  'éléphant',
  'éléphant',
  'éléphant',
  'éléphant',
  'éléphant',
  'éléphant',
  'éléphant',
  'éléphant',
  'éléphant',
  'éléphant',
  'éléphant',
  'hippopotame',
  'louise',
  'hippopotame',
  'hippopotame',
  'hippopotame',
  'hippopotame',
  'hippopotame',
  'hippopotame',
  'hippopotame',
  'hippopotame',
  'hippopotame',
  'hippopotame',
  'hippopotame',
]

const blue = [26, 16, 13, 4, 21, 29, 2, 14, 9]
const red = [27, 8, 17, 18, 24, 28, 15, 11]
const murderer = 10

const username = localStorage.getItem('username')

export default new Vuex.Store({
  state: {
    name: username,
    roomId: null,
    board: {
      cards,
      blue,
      red,
      murderer,
      foundBlue: [],
      foundRed: [],
      foundNeutral: [],
    },
    game: null,
  },
  mutations: {
    updateName(state, name) {
      state.name = name
      localStorage.setItem('username', name)
    },
    enterRoom(state, rid) {
      state.roomId = rid
    },
    initGame(state) {},
  },
  actions: {
    sendGameState(store) {
      if (store.state.game) {
        // socket.emit('game', )
      }
    },
    leaveRoom(store, rid) {
      if (rid) {
        socket.emit('leave-room', {
          name: store.state.name,
          rid,
        })
      } else {
        socket.emit('leave-room', {
          name: store.state.name,
          rid: store.state.roomId,
        })
      }
    },
    getRooms(store) {
      socket.emit('get-rooms')
    },
    joinRoom(store, id) {
      socket.emit('enter-room', {
        rid: id,
        name: store.state.name,
      })
      router.push(`preparation/${id}`)
      store.commit('enterRoom', id)
    },
    createRoom(store, privateRoom) {
      socket.emit('create-room', store.state.name)
      socket.on('create-room', rid => {
        socket.off('create-room')
        router.push(`preparation/${rid}`)
        store.commit('enterRoom', rid)
      })
    },
  },
  modules: {},
})
