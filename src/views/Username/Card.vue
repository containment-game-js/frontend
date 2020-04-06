<template lang="html">
  <card pad-y>
    <card-header>{{ $t('home.title.username') }}</card-header>
    <card-content>
      <input
        class="full"
        @keydown.space.prevent
        @input="$store.commit('updateName', $event.target.value)"
        :value="$store.state.name"
        :placeholder="$t('home.input.username')"
      />
    </card-content>
  </card>
</template>

<script>
import Card from '@/components/Card.vue'
import CardHeader from '@/components/Card/Header.vue'
import CardContent from '@/components/Card/Content.vue'

export default {
  components: {
    Card,
    CardHeader,
    CardContent,
  },
}
</script>
