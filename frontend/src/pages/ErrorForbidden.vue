<template>
  <div
    class="fullscreen bg-dark text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">403</div>

      <div class="text-h2" style="opacity: 0.4">You shall not pass...</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Back"
        no-caps
        autofocus
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ErrorForbidden'
});
</script>
