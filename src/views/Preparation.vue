<template lang="html">
  <div class="" v-if="!roomFound">
    <h1>Welcome to room {{ this.roomInfo.name }}</h1>
    <div v-if="this.roomInfo.privateRoom">This room is private</div>
    <div v-else>This room is not private</div>
    <div v-if="this.isHost">You're the host of the room</div>
    <div class="">
      {{ this.roomInfo }}
    </div>
  </div>
  <div class="" v-else>
    Room not found
  </div>
</template>

<script>
import { socket } from '@/services/socket.io'
import { connectionURL } from '@/services/backend'

export default {
  props: {
    rid: String,
  },
  data() {
    const roomInfo = {}
    return { roomInfo, roomFound: false }
  },
  mounted: async function () {
    const { rid } = this
    this.$store.dispatch('joinRoom', rid)
    const response = await fetch(`${connectionURL()}/get-room-info/${rid}`)
    if (response.status === 200) {
      const value = await response.json()
      this.roomInfo = value
      socket.on('users', users => (this.roomInfo.players = users))
      socket.emit('action', 'hello it’s me !' + this.$store.state.name)
    } else {
      this.roomFound = true
    }
  },
  computed: {
    isHost() {
      return this.$store.state.uid === this.roomInfo.host
    },
  },
}
</script>

<style lang="css" scoped></style>
