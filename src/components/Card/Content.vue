<template lang="html">
  <div :class="{ pad }">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    pad: {
      type: Boolean,
      default: true,
    },
  },
}
</script>

<style lang="css" scoped>
.pad {
  padding: 12px;
}
</style>
