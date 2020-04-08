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
  background: var(--background);
  color: var(--ternary);
}

p {
  margin: 0;
}

* {
  box-sizing: border-box;
}

input {
  color: inherit;
  background: inherit;
  border: none;
  font-size: inherit;
  width: 100%;
  outline: none;
}

input[type='checkbox'] {
  width: auto;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.pad {
  padding: 12px;
}

.xl-pad {
  padding: 48px;
}

.s-pad {
  padding: 6px;
}

.l-pad {
  padding: 24px;
}

.xs-mar-top {
  margin-top: 3px;
}

.pad-bottom {
  padding-bottom: 6px;
}

.pad-y {
  padding-top: 12px;
  padding-bottom: 12px;
}

.pad-x {
  padding-right: 12px;
  padding-left: 12px;
}

.s-pad-y {
  padding-top: 6px;
  padding-bottom: 6px;
}

.s-pad-x {
  padding-right: 6px;
  padding-left: 6px;
}

.s-mar-y {
  margin-top: 6px;
  margin-bottom: 6px;
}

.s-mar-x {
  margin-right: 6px;
  margin-left: 6px;
}

.mar {
  margin: 12px;
}

.mar-bottom {
  margin-bottom: 6px;
}

.mar-y {
  margin-top: 12px;
  margin-bottom: 12px;
}

.mar-x {
  margin-right: 12px;
  margin-left: 12px;
}

.code-inline {
  background: var(--primary);
  color: inherit;
  border-radius: 5px;
  padding: 3px 6px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier,
    monospace;
}

.border-radius {
  border-radius: 5px;
}

.grow {
  flex: 1;
}

.visible-s {
  display: none;
}

@media (max-width: 900px) {
  .visible-s {
    display: block;
  }
}
</style>
