<template>
  <div class="channel">
    <ChannelItem :channel="channel"></ChannelItem>
    <!-- <p>{{ progress }}</p>
    <p>{{ status }}</p> -->
    <v-list>
      <v-list-item v-for="video in videos" :key="video.id">
        <v-row :class="{ 'light-green': video.downloaded }">
          <v-col cols="auto">
            <v-img
              class="video-img"
              :src="video.thumbnail"
              max-width="350"
              @click="watchVideo(video.id)"
            />
          </v-col>
          <v-col>
            <v-card flat class="mt-3">
              <v-card-title>
                {{ video.title }}
              </v-card-title>
              <v-card-actions>
                <v-btn @click="download('mp3', video)" color="red" icon>
                  <v-icon>mdi-music-note</v-icon>
                </v-btn>
                <v-btn @click="download('mp4', video)" color="green" icon>
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
import { shell } from 'electron'
import ChannelItem from '@/components/ChannelItem.vue'
import fs from 'fs'
import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'

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
      videos: [],
      progress: {},
      status: ''
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
    watchVideo: function (videoId) {
      shell.openExternal('https://www.youtube.com/watch?v=' + videoId)
    },
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
    download(format, video) {
      this.status = 'downloading'
      const BASE_PATH = `https://www.youtube.com/watch?v=`
      const url = BASE_PATH + video.id
      console.log('downloadMp3')
      const saveDir = '/Users/akokubu/Dropbox/Youtube'
      var mp4SavePath

      if (format === 'mp3') {
        mp4SavePath = '/tmp/' + video.id + '.mp4'
      } else {
        mp4SavePath = saveDir + '/' + video.title.replace(/\//g, '_') + '.mp4'
      }

      const mp4Video = ytdl(url)
      mp4Video.pipe(fs.createWriteStream(mp4SavePath))
      mp4Video.on('progress', (chunkLength, downloaded, total) => {
        this.progress = parseInt((downloaded / total) * 100)
      })
      mp4Video.on('end', () => {
        // convert mp3
        if (format === 'mp3') {
          this.status = 'converting'
          this.progress = 0

          ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg')
          const proc = ffmpeg({ source: mp4SavePath })
          var savePath =
            saveDir + '/' + video.title.replace(/\//g, '_') + '.mp3'
          proc.format('mp3').audioBitrate(128)
          proc.on('progress', (progress) => {
            this.progress = parseInt(progress.percent)
          })
          proc.on('end', () => {
            this.status = ''
            this.progress = 0
            this.$set(video, 'downloaded', true)
            // this.$emit('video-downloaded', this.video)
          })
          proc.output(savePath).run()
        } else {
          this.status = ''
          this.progress = 0
          this.$set(video, 'downloaded', true)
          // this.$emit('video-downloaded', this.video)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.video-img {
  cursor: pointer;
}
</style>
