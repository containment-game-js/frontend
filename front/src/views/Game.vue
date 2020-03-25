<template lang="html">
  <div class="layout">
    <div class="nav">
      Navbar
      Room id: {{$route.params.id}}
    </div>
    <aside class="sidebar">
      Sidebar
      <div class="player" v-for="p in players" v-bind:key="p.id">
        {{p.name}}
      </div>
    </aside>
    <div class="board">
      <div class="card" v-for="(card,i) in cards" :key="card+i" @click="action({name: card})">
        {{ card }}
      </div>
    </div>
  </div>
</template>

<script>
import {
  socket,
  reconnect
} from '@/services/socket.io'
export default {
  mounted() {
    const zis = this
    socket.on('action', (val) => console.log('action', val))
    socket.on('users', (users) => {
      zis.players = users
    })
    socket.on('go-private', () => {
      console.log('private')
      socket.upgrade()
    });
  },
  beforeDestroy() {
    socket.emit('users', this.players.filter(p => p.id != socket.id))
    socket.off('action')
    socket.off('users')
    socket.off('go-private')
    reconnect()
    this.$store.dispatch('leaveRoom')
  },
  data() {
    return {
      players: []
    }
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
    }
  },
  methods: {
    action(params) {
      console.log(params)
      socket.emit('action', params)
    }
  }
}
</script>

<style lang="css" scoped>
.layout {
  height: 100vh;
  display: grid;
  grid-template-areas:
    "nav nav"
    "sidebar board";
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 5px;
  box-shadow: #e6e6e6 0px 0px 3px 2px;
  text-transform: uppercase;
}
</style>
