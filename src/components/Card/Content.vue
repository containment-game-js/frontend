<template lang="html">
  <div class="card-content" :class="{ pad }">
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

.card-content {
  flex: 1;
}
</style>
