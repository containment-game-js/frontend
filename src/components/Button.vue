<template lang="html">
  <button
    v-if="to === null"
    class="button"
    :class="{ disabled, pulse }"
    @click="$emit('click')"
  >
    <slot />
  </button>
  <router-link
    v-else-if="to !== null && !link"
    class="button"
    :class="{ disabled, pulse }"
  >
    <slot />
  </router-link>
  <a
    v-else
    :href="to"
    @click.prevent="$emit('click')"
    class="button"
    :class="{ disabled, pulse }"
  >
    <slot />
  </a>
</template>

<script>
export default {
  props: {
    to: {
      type: String,
      default: null,
    },
    link: Boolean,
    disabled: Boolean,
    pulse: Boolean,
  },
}
</script>

<style lang="css" scoped>
.button {
  display: block;
  width: 100%;
  border: none;
  font-size: 1rem;
  padding: 12px;
  border-radius: 5px;
  background: var(--primary);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  text-align: center;
  transition: all 0.2s;
  outline: none;
}

.button.disabled {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.6;
}
</style>
