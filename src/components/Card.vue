<template lang="html">
  <div :class="{ padY: padY || pad, padX: padX || pad }">
    <div :class="{ card: true, contrast }">
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
}
</script>

<style lang="css" scoped>
.card {
  /* Set defaults for non contrasted card. */
  --background: transparent;
  --border-color: var(--primary);
  --text-color: inherit;

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

.padY {
  padding-top: 12px;
  padding-bottom: 12px;
}

.padX {
  padding-right: 12px;
  padding-left: 12px;
}
</style>
