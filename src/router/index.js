import Vue from 'vue'
import VueRouter from 'vue-router'
import * as storage from '@/services/storage'
import Home from '@/views/Home.vue'
import Game from '@/views/Game.vue'
import Preparation from '@/views/Preparation.vue'
import EnterUsername from '@/views/Username/Enter.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/game/:rid',
    name: 'Game',
    component: Game,
    props: true,
  },
  {
    path: '/enter-username',
    name: 'EnterUsername',
    component: EnterUsername,
    props: route => ({ ...route.query }),
  },
  {
    path: '/preparation/:rid',
    name: 'Preparation',
    component: Preparation,
    props: true,
    meta: {
      requiresName: true,
    },
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresName) {
    const name = storage.getUsername()
    if (name && name !== '') {
      next()
    } else {
      next({
        name: 'EnterUsername',
        query: {
          redirects: 'Preparation',
          rid: to.params.rid,
        },
        replace: true,
      })
    }
  } else {
    next()
  }
})

export default router
