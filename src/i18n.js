import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from '@/assets/i18n/en.json'
import fr from '@/assets/i18n/fr.json'

Vue.use(VueI18n)

const messages = { en, fr }

const [locale] = (navigator.language || navigator.userLanguage).split('-')

export default new VueI18n({
  locale,
  fallbackLocale: 'en',
  messages,
})
