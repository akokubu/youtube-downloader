<template>
  <div class="channels">
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
          <ChannelItem
            v-for="channel in channel.channels"
            :key="channel.channel_id"
            :channel="channel"
          ></ChannelItem>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import ChannelItem from '@/components/ChannelItem.vue'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      channel_id: '',
      title: '',
      channels: []
    }
  },
  components: {
    ChannelItem
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
