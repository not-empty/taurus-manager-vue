<template>
  <div>
    <div class="d-flex justify-space-between">
      <h2 class="mb-4">Filas</h2>
      <v-btn color="primary" dark @click="dialog = true">
        Nova Fila
      </v-btn>
    </div>

    <v-card class="mb-5">
      <v-container>
        <v-row>
          <v-col sm="12" md="12" lg="12">
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">Name</th>
                    <th class="text-left">Host</th>
                    <th class="text-left">Port</th>
                    <th class="text-left">Group</th>
                    <th class="text-left">Description</th>
                    <th class="text-left">Compliance</th>
                    <th class="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="queue in queues" :key="queue.id">
                    <td>{{ queue.name }}</td>
                    <td>{{ queue.host }}</td>
                    <td>{{ queue.port }}</td>
                    <td>{{ queue.group.name }}</td>
                    <td>{{ queue.description }}</td>
                    <td>{{ queue.compliance }}</td>
                    <td>
                      <v-icon class="mr-4" @click="editQueue(queue)">mdi-pencil</v-icon>
                      <v-icon @click="deleteQueue(queue)">mdi-delete</v-icon>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <v-dialog v-model="dialog" persistent max-width="600px" v-if="dialog">
      <QueueForm @close="close()" :queue="edit"></QueueForm>
    </v-dialog>
  </div>

</template>

<script lang="ts">
import Vue from "vue";
import { IQueue } from "~/types/queue";
import QueueForm from "~/components/queues/form.vue"
export default Vue.extend({
  middleware: "auth",
  name: "IndexPage",
  components: { QueueForm },
  data() {
    return {
      queues: [] as IQueue[],
      dialog: false,
      edit: {} as IQueue | null,
    };
  },
  async created() {
    this.getQueues()
  },
  methods: {
    editQueue(queue: IQueue) {
      this.edit = queue
      this.dialog = true
    },
    close() {
      this.edit = null
      this.dialog = false
    },
    deleteQueue(queue: IQueue) {
      this.$api.queue.delete(queue.id).then(() => {
        this.getQueues()
      })
    },
    getQueues() {
      this.$api.queue.getPaginated(1, 20).then((response) => {
        this.queues = response.queues
      })
    }
  },
});
</script>
