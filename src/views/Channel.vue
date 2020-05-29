<template>
  <div class="channel">
    <h1>This is a {{ id }} channel page</h1>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped></style>
