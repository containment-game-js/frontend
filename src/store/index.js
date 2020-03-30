import Vue from 'vue'
import Vuex from 'vuex'
import uuid from 'uuid/v4'
import router from '@/router'
import { socket } from '@/services/socket.io'
import { CodeNamesEngine } from '@/engine/CodeNamesEngine'

Vue.use(Vuex)

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

export default new Vuex.Store({
  state: {
    uid: getUid(),
    name: localStorage.getItem('username'),
    roomId: null,
    engine: null,
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
    addEngine(state, engine) {
      state.engine = engine
    },
  },
  actions: {
    launchGame(store, teams, players, spies) {
      const finalPlayers = players.map(player => {
        const isBlue = teams.blue.includes(player.id)
        const team = isBlue ? 'blue' : 'red'
        const spy = spies[team] === player.id
        return { ...player, team, spy }
      })
      const engine = CodeNamesEngine(finalPlayers)
      store.commit('addEngine', engine)
      router.push(`/game/${store.state.roomId}`)
    },
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
