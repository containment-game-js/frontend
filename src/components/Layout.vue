<template lang="html">
  <div>
    <nav class="navbar pad">
      <h1>Containment Game</h1>
      <slot name="navbar" />
    </nav>
    <aside class="sidebar">
      <slot name="sidebar" />
    </aside>
    <main class="main pad">
      <slot />
    </main>
  </div>
</template>

<script>
export default {}
</script>

<style lang="css" scoped>
.navbar {
  border-bottom: 1px solid var(--primary);
  display: flex;
  position: sticky;
  top: 0;
  background: var(--background);
}

.main {
  max-width: 700px;
  margin: auto;
}
</style>
