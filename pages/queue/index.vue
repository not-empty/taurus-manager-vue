<template>
  <div>
    <v-row>
      <v-col sm="12" md="12" lg="12">
        <h2>Filas</h2>
      </v-col>
    </v-row>

    <v-card v-for="queue in queues" :key="queue.id" class="mb-5">
      <v-container>
        <v-row>
          <v-col sm="12" md="6" lg="3">
            <span>Name:</span>
            <v-text-field readonly outlined v-model="queue.name"></v-text-field>
          </v-col>
          <v-col sm="12" md="6" lg="3">
            <span>Host:</span>
            <v-text-field readonly outlined v-model="queue.host"></v-text-field>
          </v-col>
          <v-col sm="12" md="6" lg="3">
            <span>Port:</span>
            <v-text-field readonly outlined v-model="queue.port"></v-text-field>
          </v-col>
          <v-col sm="12" md="6" lg="3">
            <span>Description:</span>
            <v-text-field
              readonly
              outlined
              v-model="queue.description"
            ></v-text-field>
          </v-col>
          <v-col sm="12" md="6" lg="3">
            <span>Compliance:</span>
            <v-text-field
              readonly
              outlined
              v-model="queue.compliance"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { IQueue } from "~/types/queue";
export default Vue.extend({
  middleware: "auth",
  name: "IndexPage",
  data() {
    return {
      logado: "",
      queues: [] as IQueue[],
    };
  },
  async created() {
    let queues = await this.$api.queue.getPaginated(1, 20);
    this.queues = queues.queues;
  },
  methods: {},
});
</script>
