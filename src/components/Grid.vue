<template lang="html">
  <div :class="paddingClasses">
    <div :class="classNames" :style="style">
      <slot />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  props: {
    pad: Boolean,
    padY: Boolean,
    padX: Boolean,
    contrast: Boolean,
    border: Boolean,
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
    justify: {
      type: String,
      default: 'stretch',
      validator(value) {
        const values = ['stretch', 'center', 'end', 'start']
        const isCorrect = values.includes(value)
        if (!isCorrect) {
          const warning = `Justify should be one of [${values.join(', ')}].`
          Vue.$log.warn([warning, `You gave ${value}.`].join(' '))
        }
        return isCorrect
      },
    },
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
      const generatedColumns = `grid-template-columns: ${
        templateColumns || `repeat(${columns}, 1fr)`
      }`
      const generatedRows = `grid-template-rows: ${
        templateRows || `repeat(${rows}, 1fr)`
      }`
      return [generatedColumns, generatedRows].join(';')
    },
    paddingClasses() {
      const { padY, padX, pad } = this
      const vertical = padY || pad
      const horizontal = padX || pad
      return { 'pad-y': vertical, 'pad-x': horizontal }
    },
    classNames() {
      const { contrast, gap, border, justify } = this
      const grid = true
      const gridGapName = `gap-${gap}`
      const justifyItemsName = `justify-${justify}`
      return {
        'custom-grid': true,
        'grid-border': border,
        [gridGapName]: true,
        [justifyItemsName]: true,
        contrast,
      }
    },
  },
}
</script>

<style lang="css" scoped>
.custom-grid {
  --text-color: inherit;
  --background: transparent;
  display: grid;
  border-radius: 5px;
}

.custom-grid.contrast {
  --background: var(--primary);
  --text-color: var(--ternary);
}

.custom-grid > * {
  background: var(--background);
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

.grid-border {
  --border-color: var(--primary);
  border: 1px solid var(--border-color);
}

.grid-border.contrast {
  --border-color: var(--secondary);
}

.grid-border > *:nth-child(even) {
  border-bottom: 1px solid var(--border-color);
}

.grid-border > *:nth-child(odd) {
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
}

.grid-border > *:nth-last-child(-n + 2) {
  border-bottom: none;
}

.grid-border > *:nth-child(1) {
  border-top-left-radius: 5px;
}

.grid-border > *:nth-child(2) {
  border-top-right-radius: 5px;
}

.grid-border > *:nth-last-child(1) {
  border-bottom-right-radius: 5px;
}

.grid-border > *:nth-last-child(2) {
  border-bottom-left-radius: 5px;
}

.grid-border > * {
  padding: 12px;
}

.justify-stretch {
  justify-items: stretch;
}

.justify-center {
  justify-items: center;
}

.justify-end {
  justify-items: end;
}

.justify-start {
  justify-items: start;
}
</style>
