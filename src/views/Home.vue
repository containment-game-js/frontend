<template lang="html">
  <div>
    <nav class="navbar pad">
      <h1>Containment Game</h1>
    </nav>
    <main class="main pad">
      <card pad-y>
        <card-header>Enter your username</card-header>
        <card-content>
          <input
            class="full"
            @input="updateName($event.target.value)"
            :value="$store.state.name"
          />
        </card-content>
      </card>
      <card pad-y>
        <card-header>Create or join room</card-header>
        <card-content :pad="false">
          <row grow>
            <div class="separator pad">
              <row full grow align="center">
                <div>
                  <p>
                    You can create a room public or private.
                  </p>
                  <toggler
                    style="padding-top: 6px;"
                    label="Private"
                    v-model="privateRoom"
                  />
                </div>
                <button class="button" @click="create">Create room</button>
              </row>
            </div>
            <div class="pad">
              <row full grow align="center">
                <p>You can join a room if you know it's identifier.</p>
                <button class="button" @click="join">Join room</button>
              </row>
            </div>
          </row>
        </card-content>
      </card>
      <card pad-y>
        <card-header>Public rooms</card-header>
        <card-content>
          <grid :columns="3" gap="medium">
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
                  <h4 class="pad-bottom">Players</h4>
                  <div
                    :key="player.name + room.id"
                    v-for="player in room.players"
                    class="room-card-player"
                  >
                    {{ player.name }}
                  </div>
                </card-content>
                <card-footer>Click on the card to join!</card-footer>
              </card>
            </a>
          </grid>
        </card-content>
      </card>
    </main>
  </div>
</template>

<script>
import Row from '@/components/Row.vue'
import Card from '@/components/Card.vue'
import CardContent from '@/components/Card/Content.vue'
import CardHeader from '@/components/Card/Header.vue'
import CardFooter from '@/components/Card/Footer.vue'
import Grid from '@/components/Grid.vue'
import Toggler from '@/components/Toggler.vue'
import { socket } from '@/services/socket.io'
import { connectionURL } from '@/services/backend'

export default {
  components: {
    Row,
    Toggler,
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    Grid,
  },
  mounted: async function () {
    const response = await fetch(`${connectionURL()}/get-rooms`)
    const rooms = await response.json()
    this.updateRooms(rooms)
  },
  data() {
    return {
      modal: false,
      id: '',
      rooms: [],
      privateRoom: false,
    }
  },
  methods: {
    updateName(value) {
      this.$store.commit('updateName', value)
    },
    updateRooms(rooms) {
      this.rooms = rooms
    },
    create() {
      event.preventDefault()
      this.$store.dispatch('createRoom', this.privateRoom)
    },
    enterRoom(room) {
      if (
        this.$store.state.roomId === null ||
        this.$store.state.roomId === room.id
      ) {
        this.$router.push(`/preparation/${room.id}`)
      }
    },
    join() {
      this.modal = true
    },
    submit(event) {
      event.preventDefault()
      this.$store.dispatch('joinRoom', this.id)
    },
  },
}
</script>

<style lang="css" scoped>
.navbar {
  border-bottom: 1px solid var(--primary);
  display: flex;
}

.button {
  height: 100%;
  background: var(--primary);
  border: 1px solid var(--secondary);
  border-radius: 5px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.main {
  max-width: 700px;
  margin: auto;
}

.separator {
  border-right: 1px solid var(--primary);
}

.pad {
  padding: 12px;
}

.pad-bottom {
  padding-bottom: 6px;
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
