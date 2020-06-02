<template>
  <div class="channel">
    <ChannelItem :channel="channel"></ChannelItem>
    <v-list>
      <Video
        v-for="video in channel.videos"
        :key="video.id"
        :video="video"
        :downloaded="downloaded(video.id)"
        @deleteDownloaded="deleteDownloaded(video.id)"
        @downloadedVideo="downloadedVideo(video.id)"
      ></Video>
    </v-list>
  </div>
</template>

<script>
import ChannelItem from '@/components/ChannelItem.vue'
import Video from '@/components/Video.vue'

import { mapState } from 'vuex'
export default {
  components: {
    ChannelItem,
    Video
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  created() {
    this.$store.dispatch('channel/fetchChannel', this.id)
  },
  methods: {
    downloadedVideo(video_id) {
      this.$store.dispatch('channel/downloaded', {
        channel_id: this.channel.id,
        video_id: video_id
      })
    },
    deleteDownloaded(video_id) {
      this.$store.dispatch('channel/deleteDownloaded', {
        channel_id: this.channel.id,
        video_id: video_id
      })
    }
  },
  computed: {
    downloaded() {
      return (video_id) => this.channel.downloaded.includes(video_id)
    },
    ...mapState('channel', ['channel'])
  }
}
</script>

<style lang="scss" scoped>
.video-img {
  cursor: pointer;
}
</style>
