<template>
  <div class="channel">
    <h1>This is a {{ id }} channel page {{ channel }}</h1>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      channel: null
    }
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters('channel', ['channelById'])
  },
  created() {
    this.channel = this.channelById(this.id)
    if (this.channel == null) {
      //TODO リロードした時とか？
      console.log('todo fetch channel')
    }
  }
}
</script>

<style lang="scss" scoped></style>
