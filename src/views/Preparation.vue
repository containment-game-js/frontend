<template lang="html">
  <div class="" v-if="!roomFound">
    <h1>Welcome to room {{ roomInfo.name }}</h1>
    <div v-if="roomInfo.privateRoom">This room is private</div>
    <div v-else>This room is not private</div>
    <div v-if="isHost">You're the host of the room</div>
    <div class="players">
      <h2>Players</h2>
      <div v-for="player in roomInfo.players" :key="player.id">
        {{ player.name }}
      </div>
    </div>
    <div class="spies">
      <h2>Spies</h2>
      <div class="">Red: {{ spies.red }} Blue: {{ spies.blue }}</div>
    </div>
    <div class="teams">
      <h2>Teams</h2>
      <div class="grid">
        <div class="red-title">
          Red
        </div>
        <div class="neutral-title">
          Non choosed
        </div>
        <div class="blue-title">
          Blue
        </div>
        <div class="red" @click="updateOwnTeam('red')">
          <div v-for="player in redPlayers" :key="player.id">
            {{ player.name }}
          </div>
        </div>
        <div class="non-choosed">
          <div v-for="player in neutralPlayers" :key="player.id">
            {{ player.name }}
          </div>
        </div>
        <div class="blue" @click="updateOwnTeam('blue')">
          <div v-for="player in bluePlayers" :key="player.id">
            {{ player.name }}
          </div>
        </div>
      </div>
    </div>
    <div class="launch" v-if="isHost">
      <h2>Launch</h2>
      <button :disabled="!isLaunchable" @click="launchGame">
        Launch now !
      </button>
    </div>
  </div>
  <div class="" v-else>
    Room not found
  </div>
</template>

<script>
import { socket } from '@/services/socket.io'
import { connectionURL } from '@/services/backend'

const otherColor = color => {
  if (color === 'blue') {
    return 'red'
  } else {
    return 'blue'
  }
}

export default {
  props: {
    rid: String,
  },
  data() {
    const roomInfo = { players: [] }
    const teams = { red: [], blue: [] }
    const spies = { red: null, blue: null }
    return { roomInfo, roomFound: false, teams, spies }
  },
  mounted: async function () {
    const { rid } = this
    this.$store.dispatch('joinRoom', rid)
    const response = await fetch(`${connectionURL()}/get-room-info/${rid}`)
    if (response.status === 200) {
      const value = await response.json()
      this.roomInfo = value
      socket.on('state', ({ state }) => {
        if (!this.isHost) {
          this.teams = state.teams
          this.spies = state.spies
        }
      })
      socket.on('users', users => {
        this.roomInfo.players = users
        if (this.isHost) {
          this.updateUsersTeam()
        }
      })
      if (this.isHost) {
        socket.on('action', ({ id, action }) => {
          const otherTeam = otherColor(action)
          const temp = new Set(this.teams[action])
          temp.add(id)
          this.teams[action] = [...temp]
          this.teams[otherTeam] = this.teams[otherTeam].filter(i => i !== id)
          this.updateUsersTeam()
        })
      }
    } else {
      this.roomFound = true
    }
  },
  beforeDestroy() {
    socket.off('users')
    socket.off('state')
    socket.off('action')
  },
  methods: {
    updateUsersTeam() {
      const { rid, teams, spies } = this
      const id = this.$store.state.uid
      socket.emit('state', { id, rid, state: { teams, spies } })
    },
    updateOwnTeam(action) {
      const { rid } = this
      const id = this.$store.state.uid
      socket.emit('action', { id, rid, action })
    },
    launchGame() {
      this.$store.dispatch(
        'launchGame',
        this.teams,
        this.roomInfo.players,
        this.spies
      )
    },
  },
  computed: {
    isHost() {
      return this.$store.state.uid === this.roomInfo.host
    },
    bluePlayers() {
      return this.roomInfo.players.filter(player =>
        this.teams.blue.includes(player.id)
      )
    },
    redPlayers() {
      return this.roomInfo.players.filter(player =>
        this.teams.red.includes(player.id)
      )
    },
    neutralPlayers() {
      return this.roomInfo.players.filter(
        player =>
          !this.teams.blue.includes(player.id) &&
          !this.teams.red.includes(player.id)
      )
    },
    isLaunchable() {
      const { blue, red } = this.teams
      if (blue.length + red.length === this.roomInfo.players.length) {
        return blue.length >= 2 && red.length >= 2
      }
      return false
    },
  },
}
</script>

<style lang="css" scoped>
.grid {
  display: grid;
  grid-template:
    'red-title neutral-title blue-title'
    'reds      neutrals      blue';
  grid-template-rows: auto minmax(200px, auto);
  grid-template-columns: repeat(3, 1fr);
}

.red {
  padding: 12px;
  background: pink;
  cursor: pointer;
}

.non-choosed {
  padding: 12px;
  background: lightgrey;
  cursor: not-allowed;
}

.blue {
  padding: 12px;
  background: lightblue;
  cursor: pointer;
}
</style>
