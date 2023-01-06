<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center flex-column">
        <v-img src="/horus.png" max-width="5vw" />
        <h1>Horus</h1>
      </v-card-title>
      <div class="px-5 py-5">
        <v-form @submit.prevent="submit">
          <v-text-field
            v-model="sessionPayload.email"
            label="E-mail"
            required
            outlined
            :rules="emailRules"
          />

          <v-text-field
            v-model="sessionPayload.password"
            type="password"
            label="Passsword"
            required
            outlined
          />

          <div
            v-if="validation"
            class="d-flex justify-center pb-5 error--text"
          >
            Invalid Email or Password
          </div>

          <v-btn class="mr-4" block type="submit">
            Login
          </v-btn>
        </v-form>
      </div>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  layout: 'emptyLayout',
  middleware: 'guest',
  data () {
    return {
      sessionPayload: {
        email: '',
        password: ''
      },
      emailRules: [
        (v: string) => Boolean(v) || 'E-mail is required',
        (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ],
      validation: false
    };
  },
  methods: {
    submit () {
      this.$api.session
        .post(this.sessionPayload)
        .then((res) => {
          this.$store.dispatch('auth/setSession', res);
        })
        .catch(() => {
          this.validation = true;
        })
        .finally(() => {
          this.$router.push('/dashboard');
        });
    }
  }
});
</script>
