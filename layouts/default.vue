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
    <v-navigation-drawer
      app
      color="accent"
      v-model="drawer"
      :mini-variant.sync="drawer"
      permanent
      floating
    >
      <Sidebar @close="drawer = true"/>
    </v-navigation-drawer>
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
      menuItems: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Filas",
          url: "/queue",
          permission: "administrator",
        },
        {
          title: "Grupos",
          url: "/groups",
          permission: "administrator",
        },
        {
          title: "Usuarios",
          url: "/users",
          permission: "administrator",
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
