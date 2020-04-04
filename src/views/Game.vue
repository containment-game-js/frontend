<template lang="html">
  <layout full class="code-names-colors">
    <template v-slot:navbar>
      <div class="code-inline mar-x">
        Code Names
      </div>
      <div class="mar-x">
        {{ $t('game.navbar.turn') }}
        <span
          class="highlight"
          style="text-transform: capitalize;"
          :class="viewState.turn"
        >
          {{ $t(viewState.turn) }}
        </span>
      </div>
      <div class="mar-x">
        {{ $tc('game.navbar.spyOrPlayer', 2) }}
        <font-awesome-icon
          :icon="viewState.spyToTalk ? 'user-secret' : 'user'"
        />
        {{
          viewState.spyToTalk
            ? $t('game.navbar.spy')
            : $t('game.navbar.players')
        }}
      </div>
      <div class="mar-x">
        {{ $t('game.navbar.team') }}
        <span
          class="highlight"
          style="text-transform: capitalize;"
          :class="team"
        >
          {{ $t(team) }}
        </span>
      </div>
    </template>
    <template v-slot:sidebar>
      <div class="pad sidebar">
        <div class="pad-y">
          {{ $t('game.sidebar.play') }}
          <div class="highlight" :class="{ green: canPlay, grey: !canPlay }">
            {{ canPlay ? $t('game.sidebar.yes') : $t('game.sidebar.no') }}
          </div>
        </div>
        <div class="pad-y">
          <h3>{{ $t('game.sidebar.teams') }}</h3>
          <div class="red pad mar-y border-radius">
            <div class="player-name" v-for="p in redPlayers" :key="p.id">
              <row space align="center">
                {{ p.name }}
                <font-awesome-icon
                  style="color: #555;"
                  :icon="p.spy ? 'user-secret' : 'user'"
                />
              </row>
            </div>
          </div>
          <div class="blue pad mar-y border-radius">
            <div class="player-name" v-for="p in bluePlayers" :key="p.id">
              <row space align="center">
                {{ p.name }}
                <font-awesome-icon
                  style="color: #555;"
                  :icon="p.spy ? 'user-secret' : 'user'"
                />
              </row>
            </div>
          </div>
        </div>
        <row align="center">
          <span class="icon red" />
          <span class="s-pad-x">
            {{ $t('game.sidebar.remainingRedWords') }}
          </span>
          {{ remainingRedWords }}
        </row>
        <row align="center">
          <span class="icon blue" />
          <span class="s-pad-x">
            {{ $t('game.sidebar.remainingBlueWords') }}
          </span>
          {{ remainingBlueWords }}
        </row>
        <div class="pad-y" v-if="isSpy">
          <h3>{{ $t('game.sidebar.enterHint') }}</h3>
          <label class="s-pad-y">
            {{ $t('game.sidebar.word') }}
            <input
              type="text"
              class="s-pad xs-mar-top input"
              v-model.trim="hint"
              @keydown.space.prevent
              :disabled="!canPlay"
            />
          </label>
          <label class="s-pad-y">
            {{ $t('game.sidebar.number') }}
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
            {{ $t('game.sidebar.sendHint') }}
          </custom-button>
        </div>
        <div class="pad-y" v-else>
          <custom-button
            :disabled="!canPlay || !viewState.canPass"
            @click="pass"
            class="mar-y"
          >
            {{ $t('game.sidebar.pass') }}
          </custom-button>
        </div>
        <div class="pad-y">
          <h3>{{ $t('game.sidebar.actualHint') }}</h3>
          <div class="s-pad-y">
            {{ $t('game.sidebar.givenWord') }}
            <span class="code-inline" :class="teamHintHighlight">
              {{ displayHint }}
            </span>
          </div>
          <div class="s-pad-y">
            {{ $t('game.sidebar.givenNumber') }}
            <span class="code-inline">{{ displayNumberToGuess }}</span>
          </div>
          <p class="pad mar-y help" v-if="!isSpy && displayNumberToGuess === 0">
            {{ $t('game.sidebar.help') }}
          </p>
        </div>
      </div>
    </template>
    <div class="board">
      <transition name="overlay">
        <div class="overlay" v-if="overlayContent">
          <div class="overlay-text" v-if="overlayContent !== 'finish'">
            {{ overlayContent }}
          </div>
          <div v-if="winner !== null">
            <h1 class="xl-pad win-lose-title" v-if="winner === team">
              {{ $t('game.main.win') }}
            </h1>
            <h1 class="xl-pad win-lose-title" v-else-if="winner === otherTeam">
              {{ $t('game.main.lose') }}
            </h1>
            <row v-if="isHost">
              <custom-button class="grow" @click="anotherGame">
                {{ $t('game.main.anotherOne') }}
              </custom-button>
              <div class="pad"></div>
              <custom-button class="grow" @click="backToTeamSelection">
                {{ $t('game.main.backTeamSelection') }}
              </custom-button>
            </row>
            <row v-else>
              {{ $t('game.main.waitHost') }}
            </row>
          </div>
        </div>
      </transition>
      <div
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

const howMuchToGuess = (color, { beginner }) => {
  if (color === beginner) {
    return 9
  } else {
    return 8
  }
}

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
    const { NODE_ENV, VUE_APP_MOCK_GAME } = process.env
    const { isHost } = this.$store.state
    if (isHost && NODE_ENV === 'development' && VUE_APP_MOCK_GAME) {
      this.$store.dispatch('launchGameMock')
    }
    this.permuteOverlay(this.$t('game.main.initialization'))
  },
  beforeDestroy() {
    this.$store.dispatch('endSocket')
  },
  data() {
    return {
      hint: '',
      numberToGuess: 1,
      overlayContent: null,
      timeout: null,
      previousTimeout: null,
    }
  },
  methods: {
    permuteOverlay(content, delay = 0) {
      if (this.timeout) {
        clearTimeout(this.previousTimeout)
        this.previousTimeout = setTimeout(() => {
          this.permuteOverlay(content, delay)
        }, 1000)
      } else {
        setTimeout(() => {
          this.previousTimeout = null
          this.overlayContent = content
          this.timeout = setTimeout(() => {
            this.overlayContent = null
            this.timeout = null
          }, 2000)
        }, delay)
      }
    },
    finishOverlay() {
      if (this.timeout) {
        setTimeout(() => {
          this.finishOverlay()
        }, 1000)
      } else {
        setTimeout(() => {
          this.overlayContent = 'finish'
        }, 2000)
      }
    },
    anotherGame: async function () {
      this.overlayContent = null
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
      const { viewState, isTurn, isSpy } = this
      if (viewState.cards.length === 0) {
        return null
      } else {
        return isTurn && (viewState.spyToTalk ? isSpy : !isSpy)
      }
    },
    redPlayers() {
      return this.viewState.players.filter(({ team }) => team === 'red')
    },
    bluePlayers() {
      return this.viewState.players.filter(({ team }) => team === 'blue')
    },
    remainingRedWords() {
      const remainingToGuess = howMuchToGuess('red', this.viewState)
      return remainingToGuess - this.viewState.foundRed.length
    },
    remainingBlueWords() {
      const remainingToGuess = howMuchToGuess('blue', this.viewState)
      return remainingToGuess - this.viewState.foundBlue.length
    },
    displayNumberToGuess() {
      const { numberToGuess, spyToTalk } = this.viewState
      const shouldDisplay = numberToGuess > 0 && !spyToTalk
      return shouldDisplay ? numberToGuess - 1 : this.$t('game.sidebar.nothing')
    },
    teamHintHighlight() {
      const { spyToTalk, turn } = this.viewState
      return {
        highlight: !spyToTalk,
        [turn]: !spyToTalk,
      }
    },
    displayHint() {
      const { spyToTalk, hint } = this.viewState
      return spyToTalk ? this.$t('game.sidebar.waiting') : hint
    },
    winner() {
      return this.viewState.winner
    },
    playerTurn() {
      if (this.canPlay === null) {
        return null
      } else {
        const { spyToTalk, turn } = this.viewState
        switch (turn) {
          case 'blue':
            return spyToTalk ? 'blue-spy' : 'blue-players'
          case 'red':
            return spyToTalk ? 'red-spy' : 'red-players'
          default:
            return null
        }
      }
    },
  },
  watch: {
    playerTurn(newValue, oldValue) {
      const { isSpy, team } = this
      const delay = oldValue === null ? 0 : 2000
      const yourTurn = this.$t('game.main.yourTurn')
      const opponentTurn = this.$t('game.main.opponentTurn')
      const selectContent = cond => (cond ? yourTurn : opponentTurn)
      switch (newValue) {
        case 'blue-spy': {
          const content = selectContent(isSpy && team === 'blue')
          return this.permuteOverlay(content, delay)
        }
        case 'blue-players': {
          const content = selectContent(!isSpy && team === 'blue')
          return this.permuteOverlay(content)
        }
        case 'red-spy': {
          const content = selectContent(isSpy && team === 'red')
          return this.permuteOverlay(content, delay)
        }
        case 'red-players': {
          const content = selectContent(!isSpy && team === 'red')
          return this.permuteOverlay(content)
        }
      }
    },
    winner(newValue) {
      if (newValue) {
        this.finishOverlay()
      }
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
  position: relative;
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
  padding: 10px;
  transition: all 1s;
  color: #112d4e;
  font-size: 1.1rem;
  font-weight: 600;
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
  background: transparent;
  color: var(--white);
  opacity: 0.5;
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

.win-lose-title {
  text-align: center;
}

.help {
  background: var(--primary);
  border-radius: 5px;
}

.overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  z-index: 10;
  transition: all 0.2s;
}

.overlay-enter,
.overlay-leave-to {
  opacity: 0;
}

.overlay-fade-in {
  opacity: 1;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.5s;
}

.overlay-enter,
.overlay-leave-to {
  opacity: 0;
}

.overlay-text {
  font-size: 1.5rem;
  font-weight: 600;
  max-width: 500px;
  text-align: center;
}
</style>
