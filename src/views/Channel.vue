<template>
  <div class="channel">
    <ChannelItem :channel="channel"></ChannelItem>

    <v-list subheader>
      <v-subheader>videos</v-subheader>

      <v-list-item v-for="video in videos" :key="video.id">
        <v-row>
          <v-col cols="auto">
            <v-img :src="video.thumbnail" max-width="350" />
          </v-col>
          <v-col>
            <v-card flat class="mt-3">
              <v-card-title>
                {{ video.title }}
              </v-card-title>
              <v-card-actions>
                <v-btn @click="downloadMp3" color="red" icon>
                  <v-icon>mdi-music-note</v-icon>
                </v-btn>
                <v-btn color="green" icon>
                  <v-icon>mdi-video</v-icon>
                </v-btn>
                <v-btn color="pink" icon>
                  <v-icon>mdi-heart-outline</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <span class="body-2 font-weight-light">{{
                  video.publishedAt
                }}</span>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import ChannelItem from '@/components/ChannelItem.vue'

const { google } = require('googleapis')
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.VUE_APP_AUTH_KEY
})
import firebase from '@/firebase/firebase.js'
export default {
  data() {
    return {
      channel: {
        id: ''
      },
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
  created() {
    firebase
      .firestore()
      .collection('channels')
      .doc(this.id)
      .get()
      .then((snapshot) => {
        const channel = {
          id: snapshot.id,
          ...snapshot.data()
        }
        this.channel = channel

        let lastUpdate = null
        if (this.channel.lastUpdated) {
          const dt = new Date(this.channel.lastUpdated)
          dt.setSeconds(dt.getSeconds() + 1)
          lastUpdate = dt.toISOString().split('.')[0] + 'Z'
        }

        this.searchVideos(this.channel.channel_id, lastUpdate)
      })
  },
  methods: {
    searchVideos: async function (channelId, lastUpdate, nextPageToken) {
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
      await youtube.search.list(params).then((response) => {
        console.log(response)
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
    downloadMp3() {
      console.log('downloadMp3')
    }
  }
}
</script>

<style lang="scss" scoped></style>
