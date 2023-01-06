<style>
.scroll {
  height: 100vh;
  overflow: auto;
}

.space {
  display: block;
  height: 25px;
}
</style>

<template>
  <v-app dark>
    <Sidebar />
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import { authStore } from "~/types/authStore";
import Sidebar from "~/components/utilities/Sidebar.vue";

export default Vue.extend({
  name: "DefaultLayout",
  components: {
    Sidebar,
  },
  data() {
    return {
      title: "Constellation",
      userName: "",

      drawer: true,
      loader: false,
    };
  },
  created() {
    const session = this.$store.state as { auth: authStore };
    if (session.auth.user) {
      this.userName = session.auth.user.name;
    }
  },
  methods: {
    logout() {
      this.loader = true;
      this.$store.dispatch("auth/removeSession").then(() => {
        this.$router.push("/");
      });
    },
    hasRole(role: string | undefined) {
      const session = this.$store.state as { auth: authStore };
      if (session.auth.user?.role == role) {
        return true;
      }
      if (!role) {
        return true;
      }
      return false;
    },
  },
});
</script>
