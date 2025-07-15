<template>
  <div id="app" class="">
    <router-view />
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
#app {
  position: relative;
  height: 100vh;
  width: 100vw;
}

@media only screen and (max-width : 1200px) {
  #app {
    background-color: var(--bs-body-bg) !important;
  }
}
</style>
