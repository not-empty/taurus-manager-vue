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
      :items-per-page="pagination.itemsPerPage"
      :items="queues"
      sort-by="name"
      class="accent"
    >
      <template #[`item.actions`]="{ item }">
        <v-icon class="mr-4" @click="editQueue(item)">
          mdi-pencil
        </v-icon>
        <v-icon @click="selectDeleteQueue(item)">
          mdi-delete
        </v-icon>
      </template>
      <template #footer>
        <v-data-footer
          :items-per-page-options="itemQuantities"
          :pagination="pagination"
          :options.sync="pagination"
          show-current-page
          :page-text="`Total pages: ${pagination.pageCount}`"
          @update:options="getQueues"
        />
      </template>
    </v-data-table>

    <v-dialog v-if="dialog" v-model="dialog" persistent max-width="600px">
      <QueueForm :queue="edit" @close="close()" />
    </v-dialog>
    <confirmation
      :state="corfirmModal"
      :function="modalFunction"
      :message="modalMessage"
      @close="corfirmModal = false"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IQueue } from '~/types/queue';
import QueueForm from '~/components/queues/form.vue';
import { pagination } from '~/types/pagination';
import confirmation from '~/components/utilities/confirmationModal.vue';
export default Vue.extend({
  name: 'IndexPage',
  components: {
    QueueForm,
    confirmation
  },
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
      pagination: {
        page: 1,
        itemsPerPage: 25,
        pageCount: 1,
        pageStart: 0,
        pageStop: 1,
        itemsLength: 1
      },
      itemQuantities: [
        25,
        50,
        100,
        1000
      ],
      corfirmModal: false,
      modalFunction: () => {},
      modalMessage: '',
      selectedQueue: {} as IQueue | null
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
    deleteQueue () {
      if (this.selectedQueue) {
        this.$api.queue.delete(this.selectedQueue.id).then(() => {
          this.getQueues();
        });
      }
    },
    getQueues (pagination?: pagination) {
      if (typeof pagination !== 'undefined') {
        this.pagination = pagination;
      }
      this.$api.queue
        .getPaginated(this.pagination.page, this.pagination.itemsPerPage)
        .then((response) => {
          this.queues = response.queues;
          this.pagination.itemsLength = response.total;
          const pages = response.total / this.pagination.itemsPerPage;
          this.pagination.pageCount = Math.ceil(pages);
        });
    },
    selectDeleteQueue (queue: IQueue) {
      this.selectedQueue = queue;
      this.confirmDelete(queue);
    },
    confirmDelete (queue: IQueue) {
      this.modalFunction = this.deleteQueue;
      this.modalMessage = `Delete queue ${queue.name}?`;
      this.corfirmModal = true;
    }
  }
});
</script>
