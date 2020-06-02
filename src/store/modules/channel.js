import firebase from '@/firebase/firebase.js'

export const namespaced = true

export const state = () => ({
  channels: [],
  channel: {
    id: '',
    videos: [],
    downloaded: []
  }
})

export const getters = {
  channels: (state) => state.channels,
  channel: (state) => state.channel
}

export const mutations = {
  SET_CHANNELS: (state, payload) => {
    state.channels = payload
  },
  SET_CHANNEL: (state, payload) => {
    state.channel = payload
  },
  ADD_VIDEOS: (state, payload) => {
    state.channel.videos = payload
  },
  DELETE_CHANNEL: (state, id) => {
    state.channels = state.channels.filter((value) => value.id != id)
  },
  ADD_DOWNLOADED: (state, payload) => {
    if (!state.channel.downloaded.includes(payload.video_id)) {
      state.channel.downloaded.push(payload.video_id)
    }
  },
  REMOVE_DOWNLOADED: (state, payload) => {
    state.channel.downloaded = state.channel.downloaded.filter(
      (id) => id !== payload.video_id
    )
  }
}
const { google } = require('googleapis')
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.VUE_APP_AUTH_KEY
})

async function fetchChannel(channel_id) {
  const params = {
    part: 'snippet',
    id: channel_id
  }

  const response = await youtube.channels.list(params)
  return response.data
}

async function searchVideos(
  state,
  channelId,
  last_update,
  nextPageToken = null,
  videos = []
) {
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
  if (last_update) {
    params['publishedAfter'] = last_update
  }
  return await youtube.search.list(params).then((response) => {
    response.data.items.forEach(function (video) {
      if (!state.channel.videos.find((item) => item.id === video.id.videoId)) {
        videos.push({
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
      return videos
    }

    return searchVideos(state, channelId, last_update, next, videos).then(
      (response) => {
        return response
      }
    )
  })
}

export const actions = {
  fetchChannels({ commit }) {
    firebase
      .firestore()
      .collection('channels')
      .get()
      .then((snapshot) => {
        const channels = []
        snapshot.forEach((doc) => {
          channels.push({
            id: doc.id,
            ...doc.data()
          })
        })
        commit('SET_CHANNELS', channels)
      })
  },
  fetchChannel({ commit, state }, id) {
    firebase
      .firestore()
      .collection('channels')
      .doc(id)
      .get()
      .then((snapshot) => {
        const channel = {
          id: snapshot.id,
          ...snapshot.data(),
          videos: []
        }
        if (!channel.downloaded) {
          channel.downloaded = []
        }
        commit('SET_CHANNEL', channel)

        let last_update = null
        if (channel.last_updated) {
          const dt = new Date(channel.last_updated)
          dt.setSeconds(dt.getSeconds() + 1)
          last_update = dt.toISOString().split('.')[0] + 'Z'
        }

        searchVideos(state, channel.channel_id, last_update).then(
          (response) => {
            commit('ADD_VIDEOS', response)
          }
        )
      })
  },
  addChannel({ commit }, payload) {
    fetchChannel(payload.channel_id).then((response) => {
      const channel = {
        channel_id: payload.channel_id,
        title: payload.title,
        img: response.items[0].snippet.thumbnails.default.url
      }

      firebase
        .firestore()
        .collection('channels')
        .add({
          ...channel
        })
      commit('ADD_CHANNEL', channel)
    })
  },
  deleteChannel({ commit }, id) {
    firebase.firestore().collection('channels').doc(id).delete()
    commit('DELETE_CHANNEL', id)
  },
  downloaded({ commit }, payload) {
    firebase
      .firestore()
      .collection('channels')
      .doc(payload.channel_id)
      .update({
        downloaded: firebase.firestore.FieldValue.arrayUnion(payload.video_id)
      })
    commit('ADD_DOWNLOADED', payload)
  },
  deleteDownloaded({ commit }, payload) {
    firebase
      .firestore()
      .collection('channels')
      .doc(payload.channel_id)
      .update({
        downloaded: firebase.firestore.FieldValue.arrayRemove(payload.video_id)
      })
    commit('REMOVE_DOWNLOADED', payload)
  }
}
