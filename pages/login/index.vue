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
      this.$auth.
        loginWith('constelation', {data: {email: this.email, password: this.password}})
        .then((res) => {
          console.log(res)
        })
    }
  },
})
</script>