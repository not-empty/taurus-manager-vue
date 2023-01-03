<template>
  <v-navigation-drawer
    app
    color="accent"
    v-model="drawer"
    :mini-variant.sync="drawer"
    permanent
    floating
  >
    <v-list>
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-img src="/horus.png"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="title">Horus</v-list-item-title>
        </v-list-item-content>
        <v-btn icon @click.stop="drawer = true">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-list-item>
    </v-list>
    <v-list>
      <v-list-item
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="list"
      >
        <v-list-item-icon><v-icon>{{ link.icon }}</v-icon></v-list-item-icon>
        <v-list-item-content nuxt>
          <v-list-item-title v-text="link.title"></v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <v-list>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <v-avatar color="secondary">{{ user.name.charAt(0) }}</v-avatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ user.name }}</v-list-item-title>
          </v-list-item-content>
          <v-btn icon @click="logout">
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "Sidebar",
  data: () => ({
    drawer: false,
    links: [
      {
        icon: "mdi-view-dashboard",
        title: "Dashboard",
        to: "/dashboard",
      },
      {
        icon: "mdi-archive",
        title: "Groups",
        to: "/groups",
      },
      {
        icon: "mdi-tray-full",
        title: "Queues",
        to: "/queue",
      },
      {
        icon: "mdi-account-group",
        title: "Users",
        to: "/users",
      },
    ],
  }),
  computed: {
    ...mapGetters("auth", ["user"]),
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/removeSession');
      this.$router.push("/");
    },
  },
});
</script>

<style scoped>
.list {
  list-style: none;
}

.list:hover {
  color: #db1e72 !important;
}

.list:hover i {
  color: #db1e72 !important;
}
</style>
