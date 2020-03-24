<template lang="html">
  <div class="" v-if="!modal">
    <h2>Create room</h2>
    <button type="button" @click="create">Create room</button>
    <h2>Join room</h2>
    <button type="button" @click="join">Join room</button>
  </div>
  <div class="" v-else>
    <form @submit="submit">
      <h2>Enter id</h2>
      <input type="text" v-model="id">
      <input type="submit" value="Join">
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      modal: false,
      id: '',
    }
  },
  methods: {
    create() {

    },
    join() {
      this.modal = true
    },
    submit(event) {
      event.preventDefault()
      this.$store.dispatch('joinRoom', this.id)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
