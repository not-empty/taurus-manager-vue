<template>
  <v-breadcrumbs :items="items" class="pl-3">
    <template #item="{ item }">
      <v-breadcrumbs-item
        :to="item.href"
        :disabled="item.disabled"
        exact
      >
        {{ item.text }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'BreadCrumbs',
  props: {
    items: {
      type: Array,
      required: true
    }
  }
});
</script>
