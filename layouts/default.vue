<template>
  <v-app dark>
    <v-app-bar fixed app>
      <v-toolbar-title>
        <v-img src="horus.png" contain max-height="60px" max-width="60px"></v-img>
      </v-toolbar-title>
      <v-btn v-for="menu in menuItems" color="white" plain class="ml-1" :to="menu.url" :key="menu.title">
        {{ menu.title }}
      </v-btn>
      <v-spacer />
      {{ userName }}
    </v-app-bar>
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

export default Vue.extend({
  name: "DefaultLayout",
  data() {
    return {
      title: "Constellation",
      userName: "",
      menuItems: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Groups",
          url: "/groups",
        },
      ],
    };
  },
  created() {
    const session = this.$store.state as { auth: authStore };
    if (session.auth.user) {
      this.userName = session.auth.user.name;
    }
  },
});
</script>
