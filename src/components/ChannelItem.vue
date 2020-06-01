<template>
  <div>
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
    <v-card class="mb-3">
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
            <v-list-item-subtitle class="font-weight-light"
              >{{ channel.channel_id }} -
              {{ channel.lastUpdated }}</v-list-item-subtitle
            >
          </v-list-item-content>
          <v-list-item-action>
            <v-icon @click.stop="deleteConfirm(channel.id)">mdi-delete</v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-card-title>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialog: false
    }
  },
  props: {
    channel: {
      type: Object,
      required: true
    }
  },
  methods: {
    deleteChannel() {
      this.$store.dispatch('channel/deleteChannel', this.channel.id)
      this.dialog = false
      this.$emit('channelDeleted')
    },
    deleteConfirm() {
      this.dialog = true
    }
  }
}
</script>

<style lang="scss" scoped></style>
