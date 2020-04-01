<template lang="html">
  <div class="card-header">
    <slot />
  </div>
</template>

<script>
export default {}
</script>

<style lang="css" scoped>
.card-header {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.95rem;
  font-weight: 600;
}
</style>
