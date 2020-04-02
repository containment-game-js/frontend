<template lang="html">
  <div class="full-height" :class="paddingClasses">
    <div class="card full-height" :class="{ contrast }">
      <slot :constrast="contrast" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pad: Boolean,
    padY: Boolean,
    padX: Boolean,
    contrast: Boolean,
  },
  computed: {
    paddingClasses() {
      const { padY, padX, pad } = this
      const vertical = padY || pad
      const horizontal = padX || pad
      return { 'pad-y': vertical, 'pad-x': horizontal }
    },
  },
}
</script>

<style lang="css" scoped>
.full-height {
  height: 100%;
}

.card {
  /* Set defaults for non contrasted card. */
  --background: transparent;
  --border-color: var(--primary);
  --text-color: inherit;

  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--background);
  color: var(--text-color);
  font-size: 0.85rem;
}

.card.contrast {
  /* Swap defaults for contrasted card. */
  --border-color: var(--secondary);
  --background: var(--primary);
  --text-color: var(--ternary);
}
</style>
