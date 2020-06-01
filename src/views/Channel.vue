<template>
  <div class="channel">
    <h1>This is a {{ id }} channel page</h1>
    <ChannelItem :channel="channel"></ChannelItem>
    <ul v-for="video in videos" :key="video.id">
      <li>{{ video.title }}</li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ChannelItem from '@/components/ChannelItem.vue'

const { google } = require('googleapis')
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.VUE_APP_AUTH_KEY
})

export default {
  data() {
    return {
      channel: null,
      videos: []
    }
  },
  components: {
    ChannelItem
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
    this.getVideos()
  },
  methods: {
    searchVideos: async function (channelId, lastUpdate, nextPageToken) {
      console.log('search')
      const params = {
        part: 'snippet',
        channelId: channelId,
        maxResults: 50,
        type: 'video',
        order: 'date'
      }
      if (nextPageToken) {
        params['pageToken'] = nextPageToken
      }
      if (lastUpdate) {
        params['publishedAfter'] = lastUpdate
      }
      var self = this
      console.log(params)
      await youtube.search.list(params).then((response) => {
        console.log('await')
        response.data.items.forEach(function (video) {
          if (!self.videos.find((item) => item.id === video.id.videoId)) {
            self.videos.push({
              channelId: channelId,
              id: video.id.videoId,
              title: video.snippet.title,
              despcription: video.snippet.description,
              publishedAt: video.snippet.publishedAt,
              thumbnail: video.snippet.thumbnails.medium.url
            })
          }
        })
        const next = response.data.nextPageToken
        if (!next) {
          return
        }
        self.searchVideos(channelId, lastUpdate, next)
      })
    },

    getVideos: function (/*undownloaded = false*/) {
      let lastUpdate = null
      //      var dt = new Date('2020-04-11T09:25:52Z')
      // dt.setSeconds(dt.getSeconds() + 1)
      //      lastUpdate = dt.toISOString().split('.')[0] + 'Z'

      this.searchVideos(this.channel.channel_id, lastUpdate)
    }
  }
}
</script>

<style lang="scss" scoped></style>
