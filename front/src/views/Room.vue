<template lang="html">
  <div class="" v-if="!modal">
    <h2>Create room</h2>
    <button type="button" @click="create">Create room</button>
    <!-- <h2>Join room</h2>
    <button type="button" @click="join">Join room</button> -->
    <div class="rooms">
      <label
        v-bind:key="room.id"
        v-for="room in rooms"
        class="room"
        @click="enterRoom(room)"
      >
        {{ room.name }}
        <div v-bind:key="player.name + room.id" v-for="player in room.players">
          {{ player.name }}
        </div>
      </label>
    </div>
  </div>
  <div class="" v-else>
    <form @submit="submit">
      <h2>Enter id</h2>
      <input type="text" v-model="id" />
      <input type="submit" value="Join" />
    </form>
  </div>
</template>

<script>
import { socket } from '@/services/socket.io'
export default {
  mounted() {
    const zis = this
    socket.on('rooms', rooms => {
      zis.updateRooms(rooms)
    })
    this.$store.dispatch('getRooms')
  },
  beforeDestroy() {
    socket.off('rooms')
  },
  data() {
    return {
      modal: false,
      id: '',
      rooms: [],
    }
  },
  methods: {
    updateRooms(rooms) {
      this.rooms = rooms
    },
    create() {
      event.preventDefault()
      this.$store.dispatch('createRoom')
    },
    enterRoom(room) {
      console.log(room)
      this.$store.dispatch('joinRoom', room.id)
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
.room {
  font-weight: bold;
}

.room div {
  font-weight: normal;
  padding: 1rem;
}
</style>
