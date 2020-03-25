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
    roomId: null,
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
    enterRoom(state, rid) {
      state.roomId = rid
    }
  },
  actions: {
    leaveRoom(store, rid) {
      if (rid) {
        socket.emit('leave-room', {
          name: store.state.name,
          rid
        })
      } else {
        socket.emit('leave-room', {
          name: store.state.name,
          rid: store.state.roomId
        })
      }
    },
    getRooms(store) {
      socket.emit('get-rooms')
    },
    joinRoom(store, id) {
      socket.emit('enter-room', {
        rid: id,
        name: store.state.name
      })
      router.push('/game/' + id)
      store.commit('enterRoom', id)
    },
    createRoom(store) {
      socket.emit('create-room', store.state.name)
      socket.on('create-room', (rid) => {
        socket.off('create-room')
        router.push('/game/' + rid)
        store.commit('enterRoom', rid)
      })
    }
  },
  modules: {},
})
