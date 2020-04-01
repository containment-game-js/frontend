<template lang="html">
  <div :class="classNames" :style="style">
    <slot />
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  props: {
    columns: {
      type: Number,
      default: 1,
    },
    rows: {
      type: Number,
      default: 1,
    },
    templateColumns: String,
    templateRows: String,
    gap: {
      type: String,
      default: 'none',
      validator(value) {
        const values = ['none', 'medium', 'small', 'large']
        const isCorrect = values.includes(value)
        if (!isCorrect) {
          const warning = `Grid gap should be one of [${values.join(', ')}].`
          Vue.$log.warn([warning, `You gave ${value}.`].join(' '))
        }
        return isCorrect
      },
    },
  },
  computed: {
    style() {
      const { columns, rows, templateColumns, templateRows } = this
      const generatedColumns = `grid-template-columns: repeat(${columns}, 1fr)`
      const generatedRows = `grid-template-rows: repeat(${rows}, 1fr)`
      const finalColumns = templateColumns || generatedColumns
      const finalRows = templateRows || generatedRows
      return [finalColumns, finalRows].join(';')
    },
    classNames() {
      const grid = true
      const gridGapName = `gap-${this.gap}`
      return { grid, [gridGapName]: true }
    },
  },
}
</script>

<style lang="css" scoped>
.grid {
  display: grid;
}

.gap-medium {
  grid-gap: 12px;
}

.gap-small {
  grid-gap: 3px;
}

.gap-large {
  grid-gap: 24px;
}

.gap-none {
  grid-gap: 0px;
}
</style>
