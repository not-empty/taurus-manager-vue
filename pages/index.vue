<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col lg="6">
        <form>
          <v-text-field
            v-model="sessionPayload.email"
            label="E-mail"
            required
            outlined
          />

          <v-text-field
            v-model="sessionPayload.password"
            type="password"
            label="Passsword"
            required
            outlined
          />

          <v-btn class="mr-4" block @click="submit">
            submit
          </v-btn>
        </form>
      </v-col>
    </v-row>
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
      }
    };
  },
  methods: {
    submit () {
      this.$api.session
        .post(this.sessionPayload)
        .then((res) => {
          this.$store.dispatch('auth/setSession', res);
        })
        .finally(() => {
          this.$router.push('/dashboard');
        });
    }
  }
});
</script>
