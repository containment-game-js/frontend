import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router'
import {
  socket
} from '@/services/socket.io'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    name: 'default',
    board: {
      cards: [
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
        'éléphant',
        'hippopotame',
        'louise',
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
        'éléphant',
        'éléphant',
        'éléphant',
        'éléphant',
        'éléphant',
      ],
    },
  },
  mutations: {
    updateName(state, name) {
      state.name = name
      router.push('/room')
    },
  },
  actions: {
    getRooms(store) {
      socket.emit('get-rooms')
    },
    joinRoom(store, id) {
      socket.emit('enter-room', {
        rid: id,
        name: store.state.name
      })
      router.push('/game/' + id)
    },
    createRoom(store) {
      socket.emit('create-room', store.state.name)
      socket.on('create-room', (rid) => {
        socket.off('create-room')
        router.push('/game/' + rid)
      })
    }
  },
  modules: {},
})
