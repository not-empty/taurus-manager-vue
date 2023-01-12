<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    color="accent"
    :mini-variant="drawer"
    permanent
    floating
    expand-on-hover
  >
    <v-list>
      <v-list-item class="px-2" to="/dashboard" color="accent">
        <v-list-item-avatar>
          <v-img src="/horus.png" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="title white--text">
            Horus
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list>
      <template v-for="link in links">
        <v-list-item
          v-if="
            link.permission == $store.state.auth.user.role ||
              typeof link.permission == 'undefined' ||
              $store.state.auth.user.role == 'administrator'
          "
          :key="link.to"
          :to="link.to"
          class="list"
        >
          <v-list-item-icon><v-icon>{{ link.icon }}</v-icon></v-list-item-icon>
          <v-list-item-content nuxt>
            <v-list-item-title>
              {{ link.title }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>

    <template #append>
      <v-list>
        <v-list-item class="px-2">
          <v-list-item-avatar class="d-flex justify-center">
            <v-avatar color="secondary">
              {{ user.name.charAt(0) }}
            </v-avatar>
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
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';

export default defineComponent({
  name: 'SideBar',
  data: () => ({
    drawer: false,
    links: [
      {
        icon: 'mdi-view-dashboard',
        title: 'Dashboard',
        to: '/dashboard'
      },
      {
        icon: 'mdi-archive',
        title: 'Groups',
        to: '/groups',
        permission: 'administrator'
      },
      {
        icon: 'mdi-tray-full',
        title: 'Queues',
        to: '/queue',
        permission: 'administrator'
      },
      {
        icon: 'mdi-account-group',
        title: 'Users',
        to: '/users',
        permission: 'administrator'
      }
    ]
  }),
  computed: {
    ...mapGetters('auth', ['user'])
  },
  methods: {
    logout () {
      this.$store.dispatch('auth/removeSession');
      this.$router.push('/');
    }
  }
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

.remove-hover {
  background-color: transparent !important;
}
</style>
