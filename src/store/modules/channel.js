import firebase from '@/firebase/firebase.js'

export const namespaced = true

export const state = () => ({
  channels: []
})

export const getters = {
  channels: (state) => state.channels
}

export const mutations = {
  SET_CHANNELS: (state, payload) => {
    state.channels = payload
  },
  SET_CHANNEL: (state, payload) => {
    state.channels.push(payload)
  },
  DELETE_CHANNEL: (state, id) => {
    state.channels = state.channels.filter((value) => value.id != id)
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
      commit('SET_CHANNEL', channel)
    })
  },
  deleteChannel({ commit }, id) {
    firebase.firestore().collection('channels').doc(id).delete()
    commit('DELETE_CHANNEL', id)
  }
}
