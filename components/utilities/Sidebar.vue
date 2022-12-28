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

<template>
  <div>
    <v-list>
      <v-list-item class="px-3">
        <v-list-item-avatar>
          <v-img src="/horus.png"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="title">Horus</v-list-item-title>

        </v-list-item-content>
        <v-btn icon @click.stop="$emit('close')">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-list-item>
    </v-list>
    <v-list>
      <v-list-item v-for="link in links" :key="link.to" :href="link.to" class="list px-3">
        <v-list-item-icon><v-icon>{{ link.icon }}</v-icon></v-list-item-icon>
        <v-list-item-content nuxt>
          <v-list-item-title v-text="link.title"></v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Sidebar",
  data: () => ({
    isExtend: true,

    drawer: false,
    links: [
      {
        icon: "mdi-view-dashboard",
        title: "Dashboard",
        to: "/dashboard",
      },
      {
        icon: "mdi-archive",
        title: "Grupos",
        to: "/groups",
      },
      {
        icon: "mdi-tray-full",
        title: "Filas",
        to: "/queue",
      },
      {
        icon: "mdi-account-group",
        title: "Users",
        to: "/users",
      },
    ],
  }),
});
</script>
