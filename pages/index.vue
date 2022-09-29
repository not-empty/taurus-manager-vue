<template>
  <form>
    <v-text-field v-model="email" label="E-mail" required>
    </v-text-field>

    <v-text-field type="password" v-model="password" label="Senha" required></v-text-field>

    <v-btn class="mr-4" @click="submit">
      submit
    </v-btn>
  </form>
</template>

<script lang="ts">
import Vue from "vue";
import { authStore } from "~/types/authStore";
export default Vue.extend({
  data() {
    return {
      email: '',
      password: '',
      session: {}
    } 
  },
  methods: {
    submit() {
      const tokenState = this.$store.state as authStore
      console.log(tokenState)
    }
  },
})
</script>