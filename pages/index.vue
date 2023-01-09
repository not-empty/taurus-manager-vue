<template>
  <v-container class="d-flex justify-center align-center">
    <v-card
      class="flex-row d-flex"
      max-width="62vw"
      min-width="52vw"
    >
      <div
        class="
          blue-grey
          darken-4
          flex-grow-1
          flex-shrink-1
          d-flex
          justify-center
          align-center
        "
      >
        <v-img
          class=""
          contain
          src="/horus.svg"
          max-width="10vw"
        />
      </div>
      <div class="px-5 py-5 flex-grow-1 flex-shrink-">
        <v-form @submit.prevent="submit">
          <h1 class="mb-2">
            Horus
          </h1>
          <h3 class="font-weight-light">
            Faça seu login
          </h3>
          <br>
          <br>
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
          <br>
          <div class="min-content ml-auto">
            <v-btn
              class="mr-4"
              block
              type="submit"
              text
              color="secondary"
              width="min-content"
            >
              <v-icon left>
                mdi-login
              </v-icon>
              Login
            </v-btn>
          </div>
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
