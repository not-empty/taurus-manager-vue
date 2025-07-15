<template>
  <div class="flex flex-col h-full w-full bg-neutral-950 overflow-x-hidden">
    <Header />
    <div class="flex-1 flex flex-row">
      <Sidebar>
        <SidebarItem
          icon="projector-screen"
          label="Dashboard"
          to="/"
        />
        <SidebarItem
          icon="heartbeat"
          label="Monitor"
          to="/monitor"
          class="border-b-1"
        />
        <SidebarItem
          v-if="hasMinRole('administrator')"
          icon="users"
          label="Users"
          to="/manager/users"
        />
        <SidebarItem
          v-if="hasMinRole('administrator')"
          icon="square-half"
          label="Groups"
          to="/manager/groups"
        />
        <SidebarItem
          v-if="hasMinRole('administrator')"
          icon="queue"
          label="Queues"
          to="/manager/queues"
          class="border-b-1"
        />
        <SidebarItem
          icon="sign-out"
          label="Logout"
          to="/logout"
        />
      </Sidebar>
      <main class="p-6 text-white flex-1 overflow-auto bg-neutral-950">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from "vue";
import { usePermission } from "@/composables/permission";

import Header from "@/components/layout/Header.vue";
import Sidebar from "@/components/layout/Sidebar.vue";
import SidebarItem from "@/components/layout/SidebarItem.vue";

const collapsed = ref(false);
const { hasMinRole } = usePermission();
provide('collapsed', collapsed);

</script>
