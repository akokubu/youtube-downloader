<template>
  <div>
    <v-list-item>
      <v-row :class="{ 'light-green': downloaded }">
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
              <template v-if="status === ''">
                <v-btn @click="download('mp3', video)" color="red" icon>
                  <v-icon>mdi-music-note</v-icon>
                </v-btn>
                <v-btn @click="download('mp4', video)" color="green" icon>
                  <v-icon>mdi-video</v-icon>
                </v-btn>
              </template>
              <template v-else>
                <v-progress-circular
                  rotate="-90"
                  size="40"
                  :value="progress_download"
                  width="3"
                  color="light-green"
                  >{{ progress_download }}</v-progress-circular
                >
                <v-progress-circular
                  v-if="format === 'mp3'"
                  rotate="-90"
                  size="40"
                  :value="progress_convert"
                  width="3"
                  color="pink"
                  >{{ progress_convert }}</v-progress-circular
                >
              </template>
              <v-spacer></v-spacer>
              <span class="body-2 font-weight-light">{{
                video.publishedAt
              }}</span>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-list-item>
  </div>
</template>

<script>
import { shell } from 'electron'
import fs from 'fs'
import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'

export default {
  data() {
    return {
      status: '',
      format: '',
      progress_download: 0,
      progress_convert: 0
    }
  },
  props: {
    video: {
      type: Object,
      required: true
    },
    downloaded: {
      type: Boolean,
      require: true
    }
  },
  methods: {
    watchVideo: function (videoId) {
      shell.openExternal('https://www.youtube.com/watch?v=' + videoId)
    },
    download(format, video) {
      this.format = format
      this.progress_download = 0
      this.progress_convert = 0
      this.status = 'downloading'
      const BASE_PATH = `https://www.youtube.com/watch?v=`
      const url = BASE_PATH + video.id
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
        this.progress_download = parseInt((downloaded / total) * 100)
      })
      mp4Video.on('end', () => {
        // convert mp3
        if (format === 'mp3') {
          this.status = 'converting'
          this.progress_convert = 0

          ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg')
          const proc = ffmpeg({ source: mp4SavePath })
          var savePath =
            saveDir + '/' + video.title.replace(/\//g, '_') + '.mp3'
          proc.format('mp3').audioBitrate(128)
          proc.on('progress', (progress) => {
            this.progress_convert = parseInt(progress.percent)
          })
          proc.on('end', () => {
            this.status = ''
            this.$emit('downloadedVideo')
          })
          proc.output(savePath).run()
        } else {
          this.status = ''
          this.$emit('downloadedVideo')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
