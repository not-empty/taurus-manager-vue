<template>
  <form>
    <v-text-field v-model="email" label="E-mail" required @input="$v.email.$touch()">
    </v-text-field>

    <v-text-field type="password" v-model="password" label="Senha" required @input="$v.password.$touch()"></v-text-field>

    <v-btn class="mr-4" @click="submit">
      submit
    </v-btn>

    <v-btn @click="clear">
      clear
    </v-btn>
  </form>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    submit() {
      this.$v.$touch()
    },
    clear() {
      this.$v.$reset()
      this.name = ''
      this.email = ''
      this.select = null
      this.checkbox = false
    },
  },
}
</script>