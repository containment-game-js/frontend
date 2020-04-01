<template lang="html">
  <label class="wrapper">
    <input type="checkbox" :value="value" @input="onCheck" />
    <div :class="{ input: true, checked: value }">
      <span v-if="value" class="checkmark">
        <span class="checkmark-stem" />
        <span class="checkmark-kick" />
      </span>
    </div>
    {{ label }}
  </label>
</template>

<script>
export default {
  props: {
    label: String,
    value: Boolean,
  },
  methods: {
    onCheck() {
      this.$emit('input', !this.value)
    },
  },
}
</script>

<style lang="css" scoped>
.wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.input {
  margin-right: 6px;
  width: 17px;
  height: 17px;
  border: 1px solid var(--secondary);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
}

.input.checked {
  background: var(--primary);
}

input {
  visibility: hidden;
  width: 1px;
  height: 1px;
  position: fixed;
  top: -1000px;
  left: -1000px;
}

.checkmark {
  display: inline-block;
  width: 22px;
  height: 22px;
  transform: rotate(45deg);
}

.checkmark-stem {
  position: absolute;
  width: 3px;
  height: 8px;
  background-color: var(--secondary);
  left: 7px;
  top: 6px;
}

.checkmark-kick {
  position: absolute;
  width: 3px;
  height: 3px;
  background-color: var(--secondary);
  left: 4px;
  top: 11px;
}
</style>
