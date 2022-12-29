<template>
  <v-app dark>
    <h1 v-if="error.statusCode === 404">
      {{ pageNotFound }}
    </h1>
    <h1 v-else>
      {{ otherError }}
    </h1>
    <a @click="reload()">
      Login
    </a>
  </v-app>
</template>

<script>
export default {
  name: 'error',
  layout: 'emptyLayout',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'Server Error, try again later'
    }
  },
  head () {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  },
  methods: {
    reload() {
      window.location.reload();
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
