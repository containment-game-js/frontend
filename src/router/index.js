import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Game from '@/views/Game.vue'
import Preparation from '@/views/Preparation.vue'

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
    path: '/preparation/:rid',
    name: 'Preparation',
    component: Preparation,
    props: true,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
