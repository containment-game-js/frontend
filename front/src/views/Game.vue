<template lang="html">
  <div class="layout">
    <div class="nav">
      Navbar
      Room id: {{$route.params.id}}
    </div>
    <aside class="sidebar">
      Sidebar
    </aside>
    <div class="board">
      <div class="card" v-for="(card,i) in cards" :key="card+i">
        {{ card }}
      </div>
    </div>
  </div>
</template>

<script>
import {
  socket
} from '@/services/socket.io'
export default {
  mounted() {
    console.log(this.id)
  },
  beforeDestroy() {
    this.$store.dispatch('leaveRoom')
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
  grid-template-columns: repeat(6, 1fr);
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
