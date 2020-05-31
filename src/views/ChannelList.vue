<template>
  <div class="channels">
    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline">
          削除しますか？
        </v-card-title>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="green darken-1" text @click="deleteChannel">
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    {{ selectedId }}
    <v-container class="my-5">
      <v-layout column align-center>
        <v-flex class="mt-0 mb-3">
          <v-card width="600" class="mb-10">
            <v-card-text>
              <v-form class="px-2" ref="form">
                <v-text-field
                  v-model="channel_id"
                  label="Channel ID"
                  prepend-icon="mdi-pencil"
                ></v-text-field>
                <v-text-field
                  v-model="title"
                  label="Title"
                  prepend-icon="mdi-folder"
                ></v-text-field>

                <v-spacer></v-spacer>

                <v-btn text @click="addChannel" class="success mx-0 mt-3"
                  >Add Channel</v-btn
                >
              </v-form>
            </v-card-text>
          </v-card>
          <v-card
            v-for="channel in channel.channels"
            :key="channel.channel_id"
            class="mb-3"
          >
            <v-card-title>
              <v-list-item class="pl-0">
                <v-list-item-avatar color="grey" size="80">
                  <router-link
                    :to="{
                      name: 'Channel',
                      params: { id: channel.id }
                    }"
                  >
                    <v-img :src="channel.img" />
                  </router-link>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ channel.title }}</v-list-item-title>
                  <v-list-item-subtitle class="font-weight-light">{{
                    channel.channel_id
                  }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon @click.stop="deleteConfirm(channel.id)"
                    >mdi-delete</v-icon
                  >
                </v-list-item-action>
              </v-list-item>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
// import store from '@/store/store'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      channel_id: '',
      title: '',
      channels: [],
      dialog: false,
      selectedId: null
    }
  },
  methods: {
    addChannel() {
      const channel = {
        channel_id: this.channel_id,
        title: this.title
      }
      this.$store.dispatch('channel/addChannel', channel)

      this.channel_id = ''
      this.title = ''
    },
    deleteChannel() {
      this.$store.dispatch('channel/deleteChannel', this.selectedId)
      this.selectedId = null
      this.dialog = false
    },
    deleteConfirm(id) {
      this.dialog = true
      this.selectedId = id
    }
  },
  created() {
    this.$store.dispatch('channel/fetchChannels')
  },
  computed: {
    ...mapState(['channel'])
  }
}
</script>
