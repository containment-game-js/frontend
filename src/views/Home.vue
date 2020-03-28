<template lang="html">
  <div class="">
    <form class="" @submit="submit">
      <h1>Enter your name</h1>
      <input
        type="text"
        :value="$store.state.name"
        @input="updateName($event.target.value)"
      />
      <input type="submit" value="Submit" />
    </form>
    <h2>Create Room</h2>
    <button type="button" @click="create">Create room</button>
    <h2>Join Room</h2>
    <button type="button" @click="join">Join room</button>
    <div class="rooms">
      <label
        v-bind:key="room.id"
        v-for="room in rooms"
        class="room"
        :test="log(room)"
        @click="enterRoom(room)"
      >
        {{ room.name }}
        <div v-bind:key="player.name + room.id" v-for="player in room.players">
          {{ player.name }}
        </div>
      </label>
    </div>
  </div>
</template>

<script>
import { socket } from '@/services/socket.io'
export default {
  mounted() {
    socket.on('rooms', rooms => {
      this.updateRooms(rooms)
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
    updateName(value) {
      this.$store.commit('updateName', value)
    },
    log(...params) {
      console.log(...params)
    },
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

<style lang="css" scoped></style>