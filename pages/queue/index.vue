<template>
  <div>
    <v-flex class="d-flex align-center px-4 py-4">
      <span class="font-weight-bold text-h6">Queues</span>
      <v-spacer />
      <v-btn text color="secondary" @click="dialog = true">
        <v-icon left>
          mdi-tray-plus
        </v-icon>
        <span>New Queue</span>
      </v-btn>
    </v-flex>
    <v-data-table
      hide-default-footer
      :headers="queueHeaders"
      :items="queues"
      sort-by="name"
      class="accent"
    >
      <template #[`item.actions`]="{ item }">
        <v-icon class="mr-4" @click="editQueue(item)">
          mdi-pencil
        </v-icon>
        <v-icon @click="deleteQueue(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>

    <v-dialog v-if="dialog" v-model="dialog" persistent max-width="600px">
      <QueueForm :queue="edit" @close="close()" />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IQueue } from '~/types/queue';
import QueueForm from '~/components/queues/form.vue';
export default Vue.extend({
  name: 'IndexPage',
  components: { QueueForm },
  middleware: 'auth',
  data () {
    return {
      queues: [] as IQueue[],
      queueHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Host',
          value: 'host'
        },
        {
          text: 'Port',
          value: 'port'
        },
        {
          text: 'Group',
          value: 'group.name'
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: 'Compliance',
          value: 'compliance'
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'end',
          sortable: false
        }
      ],
      dialog: false,
      edit: {} as IQueue | null,
      page: 1,
      lenght: 1,
      pageLenght: 20,
      items: [20, 100, 500, 1000]
    };
  },
  watch: {
    page: function () {
      this.getQueues();
    },
    pageLenght: function () {
      this.getQueues();
    }
  },
  created () {
    this.getQueues();
  },
  methods: {
    editQueue (queue: IQueue) {
      this.edit = queue;
      this.dialog = true;
    },
    close () {
      this.edit = null;
      this.dialog = false;
      this.getQueues();
    },
    deleteQueue (queue: IQueue) {
      this.$api.queue.delete(queue.id).then(() => {
        this.getQueues();
      });
    },
    getQueues () {
      this.$api.queue
        .getPaginated(this.page, this.pageLenght)
        .then((response) => {
          this.queues = response.queues;
          const pages = response.total / this.pageLenght;
          this.lenght = Math.ceil(pages);
        });
    }
  }
});
</script>
