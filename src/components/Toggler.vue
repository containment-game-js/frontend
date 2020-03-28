<template lang="html">
  <label class="wrapper">
    <input class="padding" type="checkbox" :value="value" @input="onCheck" />
    {{ label }}
  </label>
</template>

<script>
export default {
  props: {
    label: String,
    value: Boolean,
  },
  methods: {
    onCheck() {
      this.$emit('input', !this.value)
    },
  },
}
</script>

<style lang="css" scoped>
.wrapper {
  display: flex;
  align-items: center;
}

.padding {
  margin-right: 6px;
}
</style>
