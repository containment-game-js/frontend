import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router'
import { socket } from '@/services/socket.io'
import { connectionURL } from '@/services/backend'
import * as storage from '@/services/storage'
import { CodeNamesEngine, otherColor } from '@/engine/code-names'
import { getRandomInt } from '@/engine/code-names/math'

Vue.use(Vuex)

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

const stopRefresh = event => {
  event.preventDefault()
  event.returnValue = ''
  return ''
}

const store = new Vuex.Store({
  state: {
    uid: storage.getUid(),
    name: storage.getUsername(),
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
  getters: {
    validName(state) {
      const { name } = state
      return name && name !== ''
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
      storage.setUsername(finalName)
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
    newSpies(store) {
      const { spies, teams } = store.state
      const blueChoosable = [...teams.blue].filter(user => user !== spies.blue)
      const redChoosable = [...teams.red].filter(user => user !== spies.red)
      const blue = blueChoosable[getRandomInt(0, blueChoosable.length)]
      const red = redChoosable[getRandomInt(0, redChoosable.length)]
      store.commit('setSpies', { blue, red })
    },
    backToTeamSelection(store) {
      const { uid, roomId } = store.state
      socket.emit('state', { id: uid, rid: roomId, state: 'back-selection' })
    },
    updateSpy(store, { pid, team }) {
      store.commit('updateSpy', { pid, team })
      store.dispatch('updateUsersTeam')
    },
    async updateRooms(store) {
      const { uid } = store.state
      const response = await fetch(`${connectionURL()}/get-rooms?id=${uid}`)
      const rooms = await response.json()
      store.commit('addRooms', rooms)
    },
    launchGame(store, locale) {
      const { teams, spies, roomInfo } = store.state
      const { players } = roomInfo
      const finalPlayers = generateEnginePlayers({ players, teams, spies })
      const engine = CodeNamesEngine(finalPlayers, locale)
      const { uid, roomId } = store.state
      store.commit('addEngine', engine)
      localStorage.setItem(`${roomId}-spies`, JSON.stringify(spies))
      localStorage.setItem(`${roomId}-teams`, JSON.stringify(teams))
      localStorage.setItem(roomId, engine.dump())
      if (router.currentRoute.name === 'Preparation') {
        socket.emit('state', { id: uid, rid: roomId, state: 'start' })
        router.push(`/game/${store.state.roomId}`)
      }
    },
    kickUser(store, kid) {
      const { roomId, uid } = store.state
      socket.emit('kick', { kid, rid: roomId, id: uid })
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
          if (state.cards !== undefined) {
            store.commit('updateGameState', state)
          }
        }
      })
      if (store.state.isHost) {
        store.dispatch('dispatchState')
        socket.on('action', action => store.dispatch('runAction', action))
      }
    },
    restoreOldState(store) {
      const { engine, roomId } = store.state
      if (engine === null) {
        const oldEngine = localStorage.getItem(roomId)
        if (oldEngine) {
          const teams = JSON.parse(localStorage.getItem(`${roomId}-teams`))
          const spies = JSON.parse(localStorage.getItem(`${roomId}-spies`))
          const { players, state, locale } = JSON.parse(oldEngine)
          const engine = CodeNamesEngine(players, locale, state)
          store.commit('setTeams', teams)
          store.commit('setSpies', spies)
          store.commit('addEngine', engine)
        }
      }
    },
    async joinRoom(store, rid) {
      const { name, uid, roomId } = store.state
      if (rid !== roomId) {
        store.commit('resetTeams')
      }
      const roomInfo = await getRoomInfo(rid)
      if (roomInfo) {
        store.commit('addRoomInfo', roomInfo)
        store.commit('setRoomId', rid)
        if (store.state.isHost) {
          window.addEventListener('beforeunload', stopRefresh)
          store.dispatch('restoreOldState')
        }
        store.dispatch('listenForWebsocket')
        socket.emit('enter-room', { rid, id: uid, name })
        socket.on('kicked', () => {
          router.push('/')
          store.dispatch('endSocket')
        })
      } else {
        router.push('/')
      }
    },
    clearLocalStorage(store) {
      const { roomId } = store.state
      localStorage.removeItem(roomId)
      localStorage.removeItem(`${roomId}-teams`)
      localStorage.removeItem(`${roomId}-spies`)
    },
    closeRoom(store) {
      const { uid, roomId } = store.state
      socket.emit('close-room', { id: uid, rid: roomId })
    },
    endSocket() {
      window.removeEventListener('beforeunload', stopRefresh)
      socket.off('kicked')
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
      if (store.state.engine.state.winner === null) {
        localStorage.setItem(store.state.roomId, store.state.engine.dump())
      } else {
        store.dispatch('clearLocalStorage')
      }
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

socket.on('reconnect', () => {
  const { name, params } = router.currentRoute
  const values = ['Preparation', 'Game']
  if (values.includes(name)) {
    store.dispatch('joinRoom', params.rid)
  }
})

export default store
