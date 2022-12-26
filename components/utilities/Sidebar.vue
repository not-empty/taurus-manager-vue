<style scoped>
.list {
  list-style: none;
}
.list a {
  text-decoration: none;
}
.list a:hover > * {
  color: #db1e72;
}
</style>

<template>
  <nav class="px-8 py-6">
    <header class="mb-4">
      <img src="/horus.png" alt="Horus" />
    </header>
    <ul class="list pl-0">
      <li v-for="link in links" class="my-4">
        <NuxtLink :to="link.to" class="d-flex align-center text-subtitle-1">
          <v-icon left>{{ link.icon }}</v-icon>
          <span v-if="isExtend">{{ link.title }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Sidebar",
  data: () => ({
    isExtend: true,
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
