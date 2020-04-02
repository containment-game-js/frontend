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

const generateEnginePlayers = ({ players, teams, spies }) => {
  return players.map(player => {
    const isBlue = teams.blue.includes(player.id)
    const team = isBlue ? 'blue' : 'red'
    const spy = spies[team] === player.id
    return { ...player, team, spy }
  })
}

export default new Vuex.Store({
  state: {
    uid: getUid(),
    name: localStorage.getItem('username'),
    roomId: null,
    engine: null,
    rooms: [],
    roomInfo: { players: [] },
    isHost: false,
    teams: { red: [], blue: [] },
    spies: { red: null, blue: null },
    gameState: {
      cards: [],
      players: [],
      foundBlue: [],
      foundRed: [],
      foundNeutral: [],
    },
  },
  mutations: {
    resetTeams(state) {
      state.teams = { red: [], blue: [] }
    },
    setSpies(state, spies) {
      state.spies = spies
    },
    setTeams(state, teams) {
      state.teams = teams
    },
    updateName(state, name) {
      const finalName = name.replace(/ /g, '')
      state.name = finalName
      localStorage.setItem('username', finalName)
    },
    setRoomId(state, rid) {
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
      if (!state.spies[action]) {
        state.spies[action] = id
      }
      if (state.spies[otherTeam] === id) {
        state.spies[otherTeam] = state.teams[otherTeam][0] || null
      }
    },
    updateSpy(state, { pid, team }) {
      state.spies[team] = pid
    },
    updateGameState(state, gameState) {
      state.gameState = gameState
    },
  },
  actions: {
    backToTeamSelection(store) {
      const { uid, roomId } = store.state
      socket.emit('state', { id: uid, rid: roomId, state: 'back-selection' })
    },
    updateSpy(store, { pid, team }) {
      store.commit('updateSpy', { pid, team })
      store.dispatch('updateUsersTeam')
    },
    async updateRooms(store) {
      const response = await fetch(`${connectionURL()}/get-rooms`)
      const rooms = await response.json()
      store.commit('addRooms', rooms)
    },
    launchGameMock(store) {
      const { players } = store.state.roomInfo
      const playersId = players.map(p => p.id)
      const teams = {
        red: playersId.slice(0, 2),
        blue: playersId.slice(2),
      }
      const spies = {
        red: teams.red[0],
        blue: teams.blue[0],
      }
      store.commit('setTeams', teams)
      store.commit('setSpies', spies)
      store.dispatch('launchGame')
    },
    launchGame(store) {
      const { teams, spies, roomInfo } = store.state
      const { players } = roomInfo
      const finalPlayers = generateEnginePlayers({ players, teams, spies })
      const engine = CodeNamesEngine(finalPlayers)
      const { uid, roomId } = store.state
      store.commit('addEngine', engine)
      if (router.currentRoute.name === 'Preparation') {
        socket.emit('state', { id: uid, rid: roomId, state: 'start' })
        router.push(`/game/${store.state.roomId}`)
      }
    },
    leaveRoom() {
      // const { name, roomId } = store.state
      // socket.emit('leave-room', { name, rid: roomId })
    },
    listenForWebsocket(store) {
      switch (router.currentRoute.name) {
        case 'Preparation':
          return store.dispatch('listenForPreparation')
        case 'Game':
          return store.dispatch('listenForGame')
      }
    },
    listenForPreparation(store) {
      socket.on('state', ({ state }) => {
        if (!store.state.isHost) {
          if (state !== 'start') {
            store.state.teams = state.teams
            store.state.spies = state.spies
          } else {
            router.push(`/game/${store.state.roomId}`)
          }
        }
      })
      socket.on('users', users => {
        store.commit('updateRoomInfoPlayers', users)
        if (store.state.isHost) {
          store.dispatch('updateUsersTeam')
        }
      })
      if (store.state.isHost) {
        socket.on('action', ({ id, action }) => {
          store.commit('updateRoomTeams', { id, action })
          store.dispatch('updateUsersTeam')
        })
        store.dispatch('updateUsersTeam')
      }
    },
    listenForGame(store) {
      socket.on('users', users => {
        store.commit('updateRoomInfoPlayers', users)
        if (store.state.isHost) {
          store.dispatch('dispatchState')
        }
      })
      socket.on('state', ({ state }) => {
        if (state === 'back-selection') {
          router.push(`/preparation/${store.state.roomId}`)
        } else {
          store.commit('updateGameState', state)
        }
      })
      if (store.state.isHost) {
        store.dispatch('dispatchState')
        socket.on('action', action => store.dispatch('runAction', action))
      }
    },
    async joinRoom(store, rid) {
      const { name, uid, roomId } = store.state
      if (rid !== roomId) {
        store.commit('resetTeams')
      }
      const roomInfo = await getRoomInfo(rid)
      store.commit('addRoomInfo', roomInfo)
      store.commit('setRoomId', rid)
      store.dispatch('listenForWebsocket')
      socket.emit('enter-room', { rid, id: uid, name })
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
        store.commit('setRoomId', rid)
      })
    },
    runAction(store, { action, id }) {
      const { type, params } = action
      store.state.engine.run(type, id, params)
      store.dispatch('dispatchState')
    },
    dispatchState(store) {
      const { engine } = store.state
      if (engine) {
        const { players } = engine
        players.forEach(player => {
          const { id } = player
          const state = store.state.engine.getState(id)
          const { uid, roomId } = store.state
          socket.emit('state', { id: uid, rid: roomId, to: id, state })
        })
      }
    },
  },
  modules: {},
})
