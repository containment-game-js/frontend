<template lang="html">
  <div
    :class="{
      row: true,
      space,
      grow,
      'no-wrap': noWrap,
      full,
      [`align-${align}`]: true,
      [`justify-${justify}`]: true,
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
    justify: {
      type: String,
      default: 'none',
      validator(value) {
        const values = ['none', 'center', 'between']
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

.justify-none {
  justify-content: stretch;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}
</style>
