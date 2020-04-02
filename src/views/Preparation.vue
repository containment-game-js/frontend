<template lang="html">
  <layout>
    <h1 class="pad-y">
      {{ $t('preparation.title.welcome') }}
      <span class="room-name">{{ roomInfo.name }}</span>
    </h1>
    <grid pad-y templateColumns="auto 1fr" border>
      <div>{{ $t('preparation.info.private') }}</div>
      <div v-if="roomInfo.privateRoom">{{ $t('preparation.info.true') }}</div>
      <div v-else>{{ $t('preparation.info.false') }}</div>
      <div>{{ $t('preparation.info.host') }}</div>
      <div>{{ this.host }}</div>
    </grid>
    <card pad-y>
      <card-header>{{ $t('preparation.title.players') }}</card-header>
      <card-content>
        <div v-for="player in roomInfo.players" :key="player.id">
          {{ player.name }}
        </div>
      </card-content>
    </card>
    <card pad-y>
      <card-header>{{ $t('preparation.title.spies') }}</card-header>
      <row>
        <card-content class="separator">
          {{ $t('preparation.card.red') }}
          <select
            class="pad-x mar-x"
            v-if="isHost"
            :value="spies.red"
            @input="updateSpy($event.target.value, 'red')"
          >
            <option
              v-for="player in redPlayers"
              :key="player.id"
              :value="player.id"
            >
              {{ player.name }}
            </option>
          </select>
          <div v-else>{{ redSpy }}</div>
        </card-content>
        <card-content>
          {{ $t('preparation.card.blue') }}
          <select
            class="pad-x mar-x"
            v-if="isHost"
            :value="spies.blue"
            @input="updateSpy($event.target.value, 'blue')"
          >
            <option
              v-for="player in bluePlayers"
              :key="player.id"
              :value="player.id"
            >
              {{ player.name }}
            </option>
          </select>
          <div v-else>{{ blueSpy }}</div>
        </card-content>
      </row>
    </card>
    <card pad-y>
      <card-header>{{ $t('preparation.title.teams') }}</card-header>
      <card-content>{{ $t('preparation.card.explanations') }}</card-content>
      <card-footer>
        <grid
          :columns="3"
          templateRows="auto minmax(200px, auto)"
          gap="medium"
          justify="center"
        >
          <div class="grid-title">{{ $t('preparation.card.redTeam') }}</div>
          <div class="grid-title">{{ $t('preparation.card.nonChoosed') }}</div>
          <div class="grid-title">{{ $t('preparation.card.blueTeam') }}</div>
          <div class="box red" @click="updateOwnTeam('red')">
            <div class="clicker">{{ $t('preparation.card.clickMe') }}</div>
            <div class="players">
              <div
                class="player-name"
                v-for="player in redPlayers"
                :key="player.id"
              >
                {{ player.name }}
              </div>
            </div>
          </div>
          <div class="box non-choosed">
            <div class="players">
              <div
                class="player-name"
                v-for="player in neutralPlayers"
                :key="player.id"
              >
                {{ player.name }}
              </div>
            </div>
          </div>
          <div class="box blue" @click="updateOwnTeam('blue')">
            <div class="clicker">{{ $t('preparation.card.clickMe') }}</div>
            <div class="players">
              <div
                class="player-name"
                v-for="player in bluePlayers"
                :key="player.id"
              >
                {{ player.name }}
              </div>
            </div>
          </div>
        </grid>
      </card-footer>
    </card>
    <div class="launch" v-if="isHost">
      <a
        :href="`/game/${rid}`"
        class="button"
        :class="{ disabled: !isLaunchable }"
        @click.prevent="launchGame"
      >
        {{ $t('preparation.launchNow') }}
      </a>
    </div>
  </layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import Card from '@/components/Card.vue'
import CardHeader from '@/components/Card/Header.vue'
import CardContent from '@/components/Card/Content.vue'
import CardFooter from '@/components/Card/Footer.vue'
import Grid from '@/components/Grid.vue'
import Row from '@/components/Row.vue'

export default {
  components: { Layout, Card, CardHeader, CardContent, CardFooter, Grid, Row },
  props: { rid: String },
  mounted() {
    this.$store.dispatch('endSocket')
    this.$store.dispatch('joinRoom', this.rid)
  },
  beforeDestroy() {
    this.$store.dispatch('endSocket')
  },
  methods: {
    updateSpy(pid, team) {
      this.$store.dispatch('updateSpy', { team, pid })
    },
    updateOwnTeam(action) {
      this.$store.dispatch('updateOwnTeam', action)
    },
    launchGame() {
      this.$store.dispatch('launchGame')
    },
  },
  computed: {
    roomInfo() {
      return this.$store.state.roomInfo || { players: [] }
    },
    isHost() {
      return this.$store.state.isHost
    },
    host() {
      if (this.isHost) {
        return 'You'
      } else {
        const { host, players } = this.roomInfo
        const player = players.find(({ id }) => id === host)
        if (player) {
          return player.name
        } else {
          return 'None'
        }
      }
    },
    teams() {
      return this.$store.state.teams
    },
    spies() {
      return this.$store.state.spies
    },
    redSpy() {
      const { spies, roomInfo } = this
      const player = roomInfo.players.find(({ id }) => id === spies.red)
      if (player) {
        return player.name
      } else {
        return 'None'
      }
    },
    blueSpy() {
      const { spies, roomInfo } = this
      const player = roomInfo.players.find(({ id }) => id === spies.blue)
      if (player) {
        return player.name
      } else {
        return 'None'
      }
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
.grid-title {
  padding: 6px;
  font-weight: 500;
  font-size: 1rem;
}

.box {
  padding: 12px;
  cursor: pointer;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.players {
  height: 100%;
  width: 100%;
  z-index: 1;
}

.background-box {
  position: absolute;
}

.red {
  background: pink;
}

.non-choosed {
  background: lightgrey;
  cursor: not-allowed;
}

.blue {
  background: lightblue;
}

.room-name {
  background: var(--primary);
  border-radius: 5px;
  padding: 3px 6px;
}

.separator {
  border-right: 1px solid var(--primary);
}

.player-name {
  font-weight: 500;
  font-size: 0.9rem;
  background: var(--primary);
  padding: 3px 6px;
  border-radius: 5px;
  margin-bottom: 6px;
}

.clicker {
  position: absolute;
  font-weight: 500;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.3);
}

.launch {
  padding: 12px 0;
}

.button {
  display: block;
  width: 100%;
  border: none;
  font-size: 1rem;
  padding: 12px;
  border-radius: 5px;
  background: var(--primary);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  text-align: center;
  transition: all 0.2s;
}

.button.disabled {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.6;
}
</style>
