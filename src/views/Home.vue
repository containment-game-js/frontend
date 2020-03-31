<template lang="html">
  <main class="main">
    <h1>Welcome to your game of containment</h1>
    <h2>Please, ensure your name is correct or enter it.</h2>
    <h3>Click on it to edit!</h3>
    <div
      style="min-height: 50px;"
      ref="editable"
      contenteditable
      @input="updateName($event.target.innerText)"
    />
    <h2>Rooms</h2>
    <row>
      <h3>Create Room</h3>
      <toggler label="Private" v-model="privateRoom" />
    </row>

    <button type="button" @click="create">Create room</button>
    <h2>Join Room</h2>
    <button type="button" @click="join">Join room</button>
    <div class="rooms">
      <a
        v-for="room in rooms"
        @click.prevent="enterRoom(room)"
        :href="`/preparation/${room.id}`"
        :key="room.id"
      >
        <label class="room">
          {{ room.name }}
          <div
            v-bind:key="player.name + room.id"
            v-for="player in room.players"
          >
            {{ player.name }}
          </div>
        </label>
      </a>
    </div>
  </main>
</template>

<script>
import Row from '@/components/Row.vue'
import Toggler from '@/components/Toggler.vue'
import { socket } from '@/services/socket.io'
import { connectionURL } from '@/services/backend'

export default {
  components: {
    Row,
    Toggler,
  },
  mounted: async function () {
    const response = await fetch(`${connectionURL()}/get-rooms`)
    const rooms = await response.json()
    this.updateRooms(rooms)
    this.$refs.editable.innerText = this.$store.state.name
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
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
}

.main {
  max-width: 700px;
  margin: auto;
}
</style>
