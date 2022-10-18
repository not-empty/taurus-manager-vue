<template>
  <v-app dark>
    <v-app-bar fixed app>
      <v-toolbar-title>
        <v-img
          src="/horus.png"
          contain
          max-height="60px"
          max-width="60px"
        ></v-img>
      </v-toolbar-title>
      <v-btn
        v-for="menu in menuItems"
        color="white"
        plain
        class="ml-1"
        :to="menu.url"
        :key="menu.title"
        :loading="loader"
      >
        {{ menu.title }}
      </v-btn>
      <v-spacer />
      <v-menu offset-y
        ><template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on">
            {{ userName }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title>Sair</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu
      >
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
        this.$router.push("/")
      });
    }
  }
});
</script>
