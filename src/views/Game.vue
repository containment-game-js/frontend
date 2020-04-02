<template lang="html">
  <layout full class="code-names-colors">
    <template v-slot:navbar>
      <div class="code-inline mar-x">Navbar Room id: {{ rid }}</div>
      <div class="mar-x">
        Turn:
        <span class="highlight" :class="viewState.turn">{{
          viewState.turn
        }}</span>
      </div>
      <div class="mar-x">
        Spy or Player:
        <font-awesome-icon :icon="userIcon" />
        {{ viewState.spyToTalk ? 'Spy' : 'Players' }}
      </div>
      <div class="mar-x">
        Team: <span class="highlight" :class="team">{{ team }}</span>
      </div>
    </template>
    <template v-slot:sidebar>
      <div class="pad sidebar">
        <div class="pad-y">
          Can I play?
          <div class="highlight" :class="{ green: canPlay, grey: !canPlay }">
            {{ canPlay ? 'Yes' : 'No' }}
          </div>
        </div>
        <div class="pad-y">
          <h3>Teams</h3>
          <div class="red pad mar-y border-radius">
            <div class="player-name" v-for="p in redPlayers" :key="p.id">
              {{ p.name }}
            </div>
          </div>
          <div class="blue pad mar-y border-radius">
            <div class="player-name" v-for="p in bluePlayers" :key="p.id">
              {{ p.name }}
            </div>
          </div>
        </div>
        <div class="pad-y" v-if="isSpy">
          <h3>Enter a hint</h3>
          <label class="s-pad-y">
            Word
            <input
              type="text"
              class="s-pad xs-mar-top input"
              v-model.trim="hint"
              @keydown.space.prevent
              :disabled="!canPlay"
            />
          </label>
          <label class="s-pad-y">
            Number
            <input
              type="number"
              class="s-pad xs-mar-top input"
              v-model.number="numberToGuess"
              min="1"
              :disabled="!canPlay"
            />
          </label>
          <custom-button
            class="mar-y"
            @click="sendHint"
            :disabled="
              !canPlay ||
              (numberToGuess === 0 || hint === '' || numberToGuess === '')
            "
          >
            Send hint
          </custom-button>
        </div>
        <div class="pad-y" v-else>
          <custom-button
            :disabled="!canPlay || !viewState.canPass"
            @click="pass"
            class="mar-y"
          >
            Pass
          </custom-button>
        </div>
        <div class="pad-y">
          <h3>Actual hint</h3>
          <div class="s-pad-y">
            Word:
            <span class="code-inline">{{
              viewState.hint || 'En attente...'
            }}</span>
          </div>
          <div class="s-pad-y">
            Number:
            <span class="code-inline">{{ viewState.numberToGuess || -1 }}</span>
          </div>
        </div>
      </div>
    </template>
    <div class="board">
      <template>
        <div class="win" v-if="viewState.winner === team">
          WINNER
        </div>
        <div class="lose" v-else-if="viewState.winner === otherTeam">
          LOSER
        </div>
      </template>
      <template v-if="viewState.winner !== null">
        <row v-if="isHost">
          <custom-button @click="anotherGame">Another one?</custom-button>
          <custom-button @click="backToTeamSelection">
            Back to team selection
          </custom-button>
        </row>
        <row v-else>
          Wait for the host to choose...
        </row>
      </template>
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
import Button from '@/components/Button.vue'
import Row from '@/components/Row.vue'
import { socket } from '@/services/socket.io'

export default {
  components: {
    CustomButton: Button,
    Layout,
    Row,
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
  },
  data() {
    return { hint: '', numberToGuess: 1 }
  },
  methods: {
    anotherGame: async function () {
      await this.$store.dispatch('launchGame')
      await this.$store.dispatch('dispatchState')
    },
    backToTeamSelection() {
      this.$store.dispatch('backToTeamSelection')
    },
    sendHint() {
      const { hint, numberToGuess, rid } = this
      const { uid } = this.$store.state
      const action = { type: 'talk', params: { hint, numberToGuess } }
      this.numberToGuess = 1
      this.hint = ''
      socket.emit('action', { id: uid, rid, action })
    },
    pass() {
      const { rid } = this
      const { uid } = this.$store.state
      socket.emit('action', { id: uid, rid, action: { type: 'pass' } })
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
      return this.$store.state.gameState || {}
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
    userIcon() {
      return this.viewState.spyToTalk ? 'user-secret' : 'users'
    },
    canPlay() {
      return (
        this.isTurn && (this.viewState.spyToTalk ? this.isSpy : !this.isSpy)
      )
    },
    redPlayers() {
      return this.viewState.players.filter(({ team }) => team === 'red')
    },
    bluePlayers() {
      return this.viewState.players.filter(({ team }) => team === 'blue')
    },
  },
}
</script>

<style lang="css" scoped>
.code-names-colors {
  --red: rgb(255, 68, 68);
  --blue: rgb(94, 146, 247);
  --green: rgb(98, 193, 64);
  --grey: rgb(119, 119, 119);
  --brown: rgb(203, 180, 153);
  --black: rgb(75, 75, 75);
  --white: rgb(255, 255, 255);
}

label {
  display: block;
}

.highlight {
  padding: 3px 6px;
  color: var(--white);
  border-radius: 5px;
  display: inline-block;
}

.board {
  grid-area: board;
  background: var(--background);
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
  box-shadow: var(--primary) 0px 0px 5px 1px;
  padding: 15px;
  transition: all 1s;
  color: #112d4e;
}

.icon {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 3px;
}

.red {
  background: var(--red);
}

.blue {
  background: var(--blue);
}

.brown {
  background: var(--brown);
}

.black {
  background: var(--black);
}

.white {
  background: var(--white);
}

.green {
  background: var(--green);
}

.grey {
  background: var(--grey);
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

.player-name {
  font-weight: 500;
  font-size: 0.9rem;
  background: var(--primary);
  padding: 3px 6px;
  border-radius: 5px;
  margin-bottom: 6px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.sidebar {
  border-right: 1px solid var(--primary);
  height: 100%;
  width: 250px;
}

.player-name:last-child {
  margin-bottom: 0;
}

.input {
  border: 1px solid var(--primary);
  border-radius: 5px;
}
</style>
