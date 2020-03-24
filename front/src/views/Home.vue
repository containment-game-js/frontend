<template lang="html">
  <div class="">
    <form class="" @submit="submit">
      <h1>Enter your name</h1>
      <input type="text" v-model="name">
      {{name}}
      <input type="submit" value="Submit">
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
    }
  },
  methods: {
    submit(event) {
      event.preventDefault()
      this.$store.commit('updateName', this.name)
    }
  },
}
</script>

<style lang="css" scoped>
</style>
