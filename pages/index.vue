<template>
  <form>
    <v-text-field v-model="sessionPayload.email" label="E-mail" required>
    </v-text-field>

    <v-text-field
      type="password"
      v-model="sessionPayload.password"
      label="Senha"
      required
    ></v-text-field>

    <v-btn class="mr-4" @click="submit"> submit </v-btn>
  </form>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      sessionPayload: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    submit() {
      this.$api.session
        .post(this.sessionPayload)
        .then((res) => {
          this.$store.dispatch("auth/setSession", res);
        })
        .finally(() => {
          this.$router.push("/dashboard");
        });
    },
  },
});
</script>