<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
:root {
  --ternary: #112d4e;
  --secondary: #3f72af;
  --primary: #dbe2ef;
  --background: #f9f7f7;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ternary: #bbe1fa;
    --secondary: #3282b8;
    --primary: #0f4c75;
    --background: #1b262c;
  }
}

body {
  margin: 0;
}

* {
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}
</style>
