import Vue from 'vue'
import Vuex from 'vuex'
import uuid from 'uuid/v4'
import router from '@/router'
import { socket } from '@/services/socket.io'
import { connectionURL } from '@/services/backend'
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
    rooms: [],
  },
  mutations: {
    updateName(state, name) {
      const finalName = name.replace(/ /g, '')
      state.name = finalName
      localStorage.setItem('username', finalName)
    },
    enterPreparation(state, rid) {
      state.roomId = rid
    },
    addEngine(state, engine) {
      state.engine = engine
    },
    addRooms(state, rooms) {
      state.rooms = rooms
    },
  },
  actions: {
    async updateRooms(store) {
      const response = await fetch(`${connectionURL()}/get-rooms`)
      const rooms = await response.json()
      store.commit('addRooms', rooms)
    },
    launchGame(store, { teams, players, spies }) {
      const finalPlayers = players.map(player => {
        const isBlue = teams.blue.includes(player.id)
        const team = isBlue ? 'blue' : 'red'
        const spy = spies[team] === player.id
        return { ...player, team, spy }
      })
      const engine = CodeNamesEngine(finalPlayers)
      const { uid, roomId } = store.state
      socket.emit('state', { id: uid, rid: roomId, state: 'start' })
      store.commit('addEngine', engine)
      router.push(`/game/${store.state.roomId}`)
    },
    leaveRoom(store) {
      const { name, roomId } = store.state
      // socket.emit('leave-room', { name, rid: roomId })
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
    runAction(store, { action, id }) {
      const { type, params } = action
      store.state.engine.run(type, id, params)
      store.dispatch('dispatchState')
    },
    dispatchState(store) {
      const { players } = store.state.engine
      players.forEach(player => {
        const { id } = player
        const state = store.state.engine.getState(id)
        const { uid, roomId } = store.state
        socket.emit('state', { id: uid, rid: roomId, to: id, state })
      })
    },
  },
  modules: {},
})
