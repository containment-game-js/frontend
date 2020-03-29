<template lang="html">
  <div class="">
    <h1>Welcome to room {{ this.roomInfo.name }}</h1>
    <div v-if="this.roomInfo.privateRoom">This room is private</div>
    <div v-else>This room is not private</div>
    <div v-if="this.isHost">You're the host of the room</div>
    <div class="">
      {{ this.roomInfo }}
    </div>
  </div>
</template>

<script>
import { socket } from '@/services/socket.io'

export default {
  props: {
    rid: String,
  },
  data() {
    const roomInfo = {}
    return { roomInfo }
  },
  mounted() {
    socket.on('room-info', roomInfo => (this.roomInfo = roomInfo))
    socket.on('users', users => (this.roomInfo.players = users))
    const { rid } = this
    socket.emit('get-room-info', { rid })
  },
  computed: {
    isHost() {
      return socket.peerId === this.roomInfo.host
    },
  },
}
</script>

<style lang="css" scoped></style>
