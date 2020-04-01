<template lang="html">
  <div
    :class="{
      row: true,
      space,
      grow,
      'no-wrap': noWrap,
      full,
      [`align-${align}`]: true,
    }"
  >
    <slot name="default" />
  </div>
</template>

<script>
export default {
  props: {
    space: Boolean,
    grow: Boolean,
    noWrap: Boolean,
    full: Boolean,
    align: {
      type: String,
      default: 'none',
      validator(value) {
        const values = ['none', 'center']
        return values.includes(value)
      },
    },
  },
}
</script>

<style lang="css" scoped>
.row {
  display: flex;
  flex-wrap: wrap;
}

.space {
  justify-content: space-between;
}

.grow > * {
  flex: 1;
}

.no-wrap {
  flex-wrap: nowrap;
}

.full {
  height: 100%;
}

.align-none {
  align-items: stretch;
}

.align-center {
  align-items: center;
}
</style>
