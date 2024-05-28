<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white no-shadow">
      <q-toolbar class="bg-black text-white no-shadow">
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-avatar
          :style="{
            marginLeft: '20px',
            marginRight: '10px'
          }"
        >
          <img
            src="/taurus.svg"
            :style="{
              width: '30px'
            }"
          />
        </q-avatar>
        <q-toolbar-title> Taurus Manager </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      :width="200"
      :breakpoint="500"
    >
      <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: '0' }">
        <q-list>
          <q-item clickable v-ripple to="/view/dashboard">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section> Dashboard </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/view/monitor">
            <q-item-section avatar>
              <q-icon name="monitor_heart" />
            </q-item-section>
            <q-item-section> Monitor </q-item-section>
          </q-item>
          <q-separator />
          <q-item
            clickable
            v-if="role === 'administrator'"
            v-ripple
            to="/manager/groups"
          >
            <q-item-section avatar>
              <q-icon name="table_view" />
            </q-item-section>
            <q-item-section> Groups Data </q-item-section>
          </q-item>
          <q-item
            clickable
            v-if="role === 'administrator'"
            v-ripple
            to="/manager/queues"
          >
            <q-item-section avatar>
              <q-icon name="dynamic_feed" />
            </q-item-section>
            <q-item-section> Queues Data </q-item-section>
          </q-item>
          <q-item
            clickable
            v-if="role === 'administrator'"
            v-ripple
            to="/manager/users"
          >
            <q-item-section avatar>
              <q-icon name="group" />
            </q-item-section>
            <q-item-section> Users Data </q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable v-ripple to="/view/logout">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section> Logout</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import sessionMixin from 'src/mixins/sessionMixin';

const { validateUser } = sessionMixin();

const drawer = ref(false);
const miniState = ref(true);
const role = ref<string>('');

onMounted(async () => {
  const userRole = await validateUser();
  if (!userRole) {
    return;
  }

  role.value = userRole;
});
</script>
