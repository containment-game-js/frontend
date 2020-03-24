import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    name: '',
    board: {
      cards: [
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
        'cheval',
      ],
    },
  },
  mutations: {
    updateName(state, name) {
      state.name = name
      router.push('/room')
    },
  },
  actions: {
    joinRoom(store, id) {
      router.push('/game')
    },
  },
  modules: {},
})
