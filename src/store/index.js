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

const otherColor = color => {
  if (color === 'blue') {
    return 'red'
  } else {
    return 'blue'
  }
}

const getRoomInfo = async rid => {
  const response = await fetch(`${connectionURL()}/get-room-info/${rid}`)
  if (response.status === 200) {
    return await response.json()
  } else {
    return null
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
    roomInfo: null,
    isHost: false,
    teams: { red: [], blue: [] },
    spies: { red: null, blue: null },
  },
  mutations: {
    resetTeams(state) {
      state.teams = { red: [], blue: [] }
    },
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
    addRoomInfo(state, roomInfo) {
      state.roomInfo = roomInfo
      state.isHost = state.uid === roomInfo.host
    },
    updateRoomInfoPlayers(state, users) {
      state.roomInfo.players = users
    },
    updateRoomTeams(state, { id, action }) {
      const otherTeam = otherColor(action)
      const temp = new Set(state.teams[action])
      temp.add(id)
      state.teams[action] = [...temp]
      state.teams[otherTeam] = state.teams[otherTeam].filter(i => i !== id)
    },
  },
  actions: {
    async updateRooms(store) {
      const response = await fetch(`${connectionURL()}/get-rooms`)
      const rooms = await response.json()
      store.commit('addRooms', rooms)
    },
    launchGame(store) {
      const { teams, spies, roomInfo } = store.state
      const { players } = roomInfo
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
    leaveRoom() {
      // const { name, roomId } = store.state
      // socket.emit('leave-room', { name, rid: roomId })
    },
    async joinRoom(store, rid) {
      const { name, uid, roomId } = store.state
      if (rid !== roomId) {
        store.commit('resetTeams')
      }
      socket.emit('enter-room', { rid, id: uid, name })
      store.commit('enterPreparation', rid)
      if (router.currentRoute.name !== 'Preparation') {
        router.push(`/preparation/${rid}`)
      }
      const roomInfo = await getRoomInfo(rid)
      store.commit('addRoomInfo', roomInfo)
      socket.on('users', users => {
        store.commit('updateRoomInfoPlayers', users)
        if (store.state.isHost) {
          store.dispatch('updateUsersTeam')
        }
      })
      socket.on('state', ({ state }) => {
        if (!store.state.isHost) {
          if (state !== 'start') {
            store.state.teams = state.teams
            store.state.spies = state.spies
          } else {
            router.push(`/game/${rid}`)
          }
        }
      })
      if (store.state.isHost) {
        socket.on('action', ({ id, action }) => {
          store.commit('updateRoomTeams', { id, action })
          store.dispatch('updateUsersTeam')
        })
      }
    },
    endSocket() {
      socket.off('users')
      socket.off('state')
      socket.off('action')
    },
    updateOwnTeam(store, action) {
      const { roomId, uid } = store.state
      socket.emit('action', { id: uid, rid: roomId, action })
    },
    updateUsersTeam(store) {
      const { roomId, uid, teams, spies } = store.state
      socket.emit('state', { id: uid, rid: roomId, state: { teams, spies } })
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
