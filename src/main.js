import Vue from 'vue'
import VueLogger from 'vuejs-logger'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import i18n from './i18n'

Vue.config.productionTip = false

const options = {
  isEnabled: true,
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  showLogLevel: true,
  showMethodName: true,
  showConsoleColors: true,
}

Vue.use(VueLogger, options)

new Vue({
  i18n,
  router,
  store,
  render: h => h(App),
}).$mount('#app')
