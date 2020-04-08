<template lang="html">
  <layout>
    {{ $t('enterUsername.title') }}
    <input-username />
    <custom-button :disabled="!validName" @click="go">
      {{ $t('enterUsername.letsGo') }}
    </custom-button>
  </layout>
</template>

<script>
import { mapGetters } from 'vuex'
import Layout from '@/components/Layout.vue'
import CustomButton from '@/components/Button.vue'
import InputUsername from '@/views/Username/Card.vue'

export default {
  props: {
    redirects: String,
    rid: String,
  },
  components: {
    Layout,
    InputUsername,
    CustomButton,
  },
  methods: {
    go() {
      const { validName, redirects, rid } = this
      if (validName) {
        this.$router.replace({ name: redirects, params: { rid } })
      }
    },
  },
  computed: {
    ...mapGetters(['validName']),
  },
}
</script>
