<template lang="html">
  <layout>
    <card pad-y>
      <card-header>{{ $t('home.title.username') }}</card-header>
      <card-content>
        <input
          class="full"
          @keydown.space.prevent
          @input="$store.commit('updateName', $event.target.value)"
          :value="$store.state.name"
        />
      </card-content>
    </card>
    <card pad-y>
      <card-header>{{ $t('home.title.enterOrJoin') }}</card-header>
      <card-content :pad="false">
        <row grow>
          <div class="separator pad">
            <row full grow align="center">
              <div>
                <p>{{ $t('home.paragraph.createRoom') }}</p>
                <toggler
                  style="padding-top: 6px;"
                  :label="$t('home.button.private')"
                  v-model="privateRoom"
                />
              </div>
              <button class="button" @click="create">
                {{ $t('home.button.createRoom') }}
              </button>
            </row>
          </div>
          <div class="pad">
            <row full grow align="center">
              <p>{{ $t('home.paragraph.joinRoom') }}</p>
              <button class="button" @click="join">
                {{ $t('home.button.joinRoom') }}
              </button>
            </row>
          </div>
        </row>
      </card-content>
    </card>
    <card pad-y>
      <card-header>
        <row align="center" space>
          {{ $tc('home.title.publicRooms', rooms.length) }}
          <refresh-ccw-icon
            size="1x"
            :class="{ refresh: true, rotating: updatingRooms }"
            @click="updateRooms"
          />
        </row>
      </card-header>
      <card-content>
        <div v-if="rooms.length === 0">{{ $t('home.paragraph.noRoom') }}</div>
        <grid v-else :columns="3" gap="medium">
          <a
            @click.prevent="enterRoom(room)"
            :href="`/preparation/${room.id}`"
            class="room-card"
            v-for="room in rooms"
            :key="room.id"
          >
            <card contrast>
              <card-header class="room-card-title">
                {{ room.name }}
              </card-header>
              <card-content>
                <h4 class="pad-bottom">
                  {{ $tc('home.title.players', room.players.length) }}
                </h4>
                <div
                  :key="player.name + room.id"
                  v-for="player in room.players"
                  class="room-card-player"
                >
                  {{ player.name }}
                </div>
              </card-content>
              <card-footer>{{ $t('home.button.cardJoin') }}</card-footer>
            </card>
          </a>
        </grid>
      </card-content>
    </card>
  </layout>
</template>

<script>
import { RefreshCcwIcon } from 'vue-feather-icons'
import Row from '@/components/Row.vue'
import Card from '@/components/Card.vue'
import CardContent from '@/components/Card/Content.vue'
import CardHeader from '@/components/Card/Header.vue'
import CardFooter from '@/components/Card/Footer.vue'
import Grid from '@/components/Grid.vue'
import Toggler from '@/components/Toggler.vue'
import Layout from '@/components/Layout.vue'

export default {
  components: {
    Row,
    Toggler,
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    Grid,
    RefreshCcwIcon,
    Layout,
  },
  mounted() {
    this.updateRooms()
    this.$store.dispatch('endSocket')
  },
  data() {
    return {
      modal: false,
      privateRoom: false,
      updatingRooms: false,
      lastTime: Date.now(),
    }
  },
  methods: {
    updateRooms() {
      this.updatingRooms = true
      this.lastTime = Date.now()
      this.$store.dispatch('updateRooms')
    },
    create() {
      const { name } = this.$store.state
      if (name !== '') {
        this.$store.dispatch('createRoom', this.privateRoom)
      }
    },
    enterRoom(room) {
      const { name } = this.$store.state
      if (name !== '') {
        this.$router.push(`/preparation/${room.id}`)
      }
    },
    join() {
      this.modal = true
    },
  },
  computed: {
    rooms() {
      return this.$store.state.rooms
    },
  },
  watch: {
    rooms() {
      if (Date.now() - this.lastTime < 1000) {
        setTimeout(() => (this.updatingRooms = false), 1000)
      } else {
        this.updatingRooms = false
      }
    },
  },
}
</script>

<style lang="css" scoped>
.button {
  height: 100%;
  background: var(--primary);
  border: 1px solid var(--secondary);
  border-radius: 5px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  color: inherit;
}

.separator {
  border-right: 1px solid var(--primary);
}

.refresh {
  cursor: pointer;
}

.rotating {
  animation: 2s linear 0s infinite running rotation;
}

.room-card {
  border-radius: 5px;
  text-decoration: none;
}

.room-card-title {
  text-transform: uppercase;
  font-weight: 600;
}

.room-card-player {
  line-height: 1.5;
}
</style>
