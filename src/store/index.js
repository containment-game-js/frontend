import Vue from 'vue'
import Vuex from 'vuex'
import uuid from 'uuid/v4'
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

const getUid = () => {
  const uid = localStorage.getItem('uid')
  if (uid) {
    return uid
  } else {
    const newId = uuid()
    localStorage.setItem('uid', newId)
    return newId
  }
}

const username = localStorage.getItem('username')
const uid = getUid()

export default new Vuex.Store({
  state: {
    uid,
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
    enterPreparation(state, rid) {
      state.roomId = rid
    },
    initGame(state) {},
  },
  actions: {
    sendGameState(store) {},
    leaveRoom(store) {
      const { name, roomId } = store.state
      socket.emit('leave-room', { name, rid: roomId })
    },
    joinRoom(store, rid) {
      if (!store.state.roomId) {
        const { name, uid } = store.state
        socket.emit('enter-room', { rid, id: uid, name })
        if (router.currentRoute.name !== 'Preparation') {
          router.push(`/preparation/${rid}`)
        }
        store.commit('enterPreparation', rid)
      }
    },
    createRoom(store, privateRoom) {
      const { name, uid } = store.state
      socket.emit('create-room', { name, id: uid, privateRoom })
      socket.on('created-room', rid => {
        socket.off('created-room')
        router.push(`/preparation/${rid}`)
        store.commit('enterPreparation', rid)
      })
    },
  },
  modules: {},
})
