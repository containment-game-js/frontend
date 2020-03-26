<template lang="html">
  <div class="layout">
    <div class="nav">Navbar Room id: {{ $route.params.id }}</div>
    <aside class="sidebar">
      Sidebar
      <div class="player" v-for="p in players" v-bind:key="p.id">
        {{ p.name }}
      </div>
    </aside>
    <div class="board">
      <div
        v-for="(card, index) in board.cards"
        :class="`card ${correctCardColor(index)}`"
        :key="card"
        @click="action({ name: card })"
      >
        <div>{{ card }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { socket, reconnect } from '@/services/socket.io'
export default {
  mounted() {
    const zis = this
    socket.on('action', val => console.log('action', val))
    socket.on('users', users => {
      zis.players = users
    })
    socket.on('go-private', () => {
      console.log('private')
      socket.upgrade()
    })
  },
  beforeDestroy() {
    socket.emit(
      'users',
      this.players.filter(p => p.id != socket.id)
    )
    socket.off('action')
    socket.off('users')
    socket.off('go-private')
    reconnect()
    this.$store.dispatch('leaveRoom')
  },
  data() {
    return {
      players: [],
    }
  },
  methods: {
    correctCardColor(index) {
      if (this.board.red.includes(index)) {
        return 'red'
      } else if (this.board.blue.includes(index)) {
        return 'blue'
      } else if (this.board.murderer === index) {
        return 'black'
      } else {
        return 'brown'
      }
    },
    action(params) {
      console.log(params)
      socket.emit('action', params)
    },
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    board() {
      return this.$store.state.board
    },
    cards() {
      return this.board.cards
    },
  },
}
</script>

<style lang="css" scoped>
.layout {
  height: 100vh;
  display: grid;
  grid-template-areas:
    'nav nav'
    'sidebar board';
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;
}

.nav {
  grid-area: nav;
  background: pink;
  padding: 12px;
}

.sidebar {
  grid-area: sidebar;
  background: lightblue;
  padding: 12px;
}

.board {
  grid-area: board;
  background: #eee;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-gap: 20px;
  padding: 20px;
}

.card {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: #d9d9d9 0px 0px 5px 1px;
  padding: 15px;
}

.red {
  background-color: rgb(255, 68, 68);
}

.blue {
  background-color: rgb(94, 146, 247);
}

.brown {
  background-color: rgb(203, 180, 153);
}

.black {
  background-color: rgb(75, 75, 75);
}

.card div {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faecca;
  background: center / cover no-repeat url('../assets/clear.jpg');
  border-radius: 5px;
  text-transform: uppercase;
  height: 100%;
  width: 100%;
}
</style>
