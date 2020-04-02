<template lang="html">
  <layout full>
    <template v-slot:navbar>
      <div class="code-inline mar-x">Navbar Room id: {{ rid }}</div>
      <div>Turn: {{ viewState.turn }}</div>
      <div>
        Spy or Player:
        {{ viewState.spyToTalk ? 'Spy' : 'Players' }}
      </div>
      <div class="">Team: {{ team }}</div>
    </template>
    <template v-slot:sidebar>
      Sidebar
      <div class="player" v-for="p in roomInfo.players" :key="p.id">
        {{ p.name }}
      </div>
      <div v-if="isSpy && isTurn && viewState.spyToTalk">
        <h2>Hint</h2>
        <label>
          Word
          <input type="text" name="" v-model="hint" />
        </label>
        <br />
        <label>
          Number
          <input type="number" name="" v-model.number="numberToGuess" />
        </label>
        <button type="button" @click="sendHint">Send hint</button>
      </div>
      <div class="">
        <h2>HINT</h2>
        <div class="">Word: {{ viewState.hint }}</div>
        <div class="">Number: {{ viewState.numberToGuess }}</div>
      </div>
    </template>
    <div class="board">
      <div v-if="viewState.winner === team">
        WINNER
      </div>
      <div v-else-if="viewState.winner === otherTeam">
        LOSER
      </div>
      <div
        v-else
        v-for="(card, index) in (viewState || {}).cards"
        :class="`card ${correctCardColor(index)} ${canClick(index)}`"
        :key="card + index"
        @click="action(index)"
      >
        <div>{{ card }}</div>
      </div>
    </div>
  </layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import { socket } from '@/services/socket.io'

export default {
  components: {
    Layout,
  },
  props: {
    rid: String,
  },
  beforeMount: async function () {},
  mounted: async function () {
    await this.$store.dispatch('joinRoom', this.rid)
    if (this.$store.state.isHost && process.env.NODE_ENV === 'development') {
      this.$store.dispatch('launchGameMock')
    }
  },
  beforeDestroy() {
    this.$store.dispatch('endSocket')
    this.$store.dispatch('leaveRoom')
  },
  data() {
    return { hint: '', numberToGuess: 0 }
  },
  methods: {
    sendHint() {
      const { hint, numberToGuess, rid } = this
      const { uid } = this.$store.state
      const action = { type: 'talk', params: { hint, numberToGuess } }
      socket.emit('action', { id: uid, rid, action })
    },
    isFound(index) {
      return (
        this.viewState.foundRed.includes(index) ||
        this.viewState.foundNeutral.includes(index) ||
        this.viewState.foundBlue.includes(index)
      )
    },
    canClick(index) {
      const founded = this.isFound(index)
      if (!founded && this.isTurn && !this.viewState.spyToTalk && !this.isSpy) {
        return 'clickable'
      } else {
        return 'none-clickable'
      }
    },
    correctCardColor(index) {
      const found = this.isCardFound(index)
      if (found) {
        return found
      } else if (this.isSpy) {
        return this.spyCorrectCardColor(index)
      } else {
        return 'white'
      }
    },
    spyCorrectCardColor(index) {
      if (this.viewState.red.includes(index)) {
        return 'red'
      } else if (this.viewState.blue.includes(index)) {
        return 'blue'
      } else if (this.viewState.murderer === index) {
        return 'black'
      } else {
        return 'brown'
      }
    },
    isCardFound(index) {
      if (this.viewState.foundRed.includes(index)) {
        return 'red hidden'
      } else if (this.viewState.foundBlue.includes(index)) {
        return 'blue hidden'
      } else if (this.viewState.foundNeutral.includes(index)) {
        return 'brown hidden'
      } else if (this.viewState.foundMurderer === index) {
        return 'black hidden'
      } else {
        return null
      }
    },
    action(cardNumber) {
      const { rid } = this
      const { uid } = this.$store.state
      const action = { type: 'guess', params: { cardNumber } }
      socket.emit('action', { id: uid, rid, action })
    },
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    engine() {
      return this.$store.state.engine || {}
    },
    board() {
      return this.engine.state || {}
    },
    cards() {
      return this.board.cards || []
    },
    roomInfo() {
      return this.$store.state.roomInfo
    },
    viewState() {
      return this.$store.state.gameState
    },
    isHost() {
      return this.roomInfo.host === this.$store.state.uid
    },
    isSpy() {
      return this.viewState.murderer !== undefined
    },
    team() {
      const { uid } = this.$store.state
      const player = this.viewState.players.find(({ id }) => id === uid)
      if (player) {
        return player.team
      } else {
        return null
      }
    },
    otherTeam() {
      if (this.team === 'red') {
        return 'blue'
      } else {
        return 'red'
      }
    },
    isTurn() {
      return this.viewState.turn === this.team || false
    },
  },
}
</script>

<style lang="css" scoped>
.board {
  grid-area: board;
  background: #eee;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-gap: 20px;
  padding: 20px;
  height: 100%;
}

.card {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: #d9d9d9 0px 0px 5px 1px;
  padding: 15px;
  transition: all 1s;
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

.white {
  background-color: white;
}

.none-clickable {
  cursor: not-allowed;
}

.clickable {
  cursor: pointer;
}

.card > div {
  display: flex;
  align-items: center;
  justify-content: center;
  background: center / cover no-repeat url('../assets/clear.jpg');
  border-radius: 5px;
  text-transform: uppercase;
  height: 100%;
  width: 100%;
  transition: all 1s;
  opacity: 1;
}

.card.hidden > div {
  opacity: 0;
}
</style>
