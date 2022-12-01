<template>
  <div>
    <v-data-table
      :headers="groupHeaders"
      :items="groups"
      sort-by="name"
      class="rounded my-4"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Grupos</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" dark @click="dialog = true">
            Novo grupo
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon class="mr-4" @click="editGroups(item)">mdi-pencil</v-icon>
        <v-icon @click="deleteGroups(item)">mdi-delete</v-icon>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" persistent max-width="600px" v-if="dialog">
      <GroupForm @close="close()" :group="edit"></GroupForm>
    </v-dialog>
  </div>
</template>
  
<script lang="ts">
import Vue from "vue";
import { IGroup } from "~/types/group";
import GroupForm from "~/components/groups/form.vue";
export default Vue.extend({
  middleware: "auth",
  name: "Groups",
  components: { GroupForm },
  data() {
    return {
      groups: [] as IGroup[],
      groupHeaders: [
        {
          text: "Name",
          value: "name",
        },
        {
          text: "Description",
          value: "description",
        },
        {
          text: "Actions",
          value: "actions",
          align: "end",
          sortable: false,
        },
      ],
      dialog: false,
      edit: {} as IGroup | null,
      page: 1,
      lenght: 1,
      pageLenght: 20,
      items: [20, 100, 500, 1000],
    };
  },
  async created() {
    this.$api.group.getPaginated(1, 25)
      .then(response => this.groups = response.groups);
  },
  methods: {
    editGroups(group: IGroup) {
      this.edit = group
      this.dialog = true
    },
    close() {
      this.edit = null
      this.dialog = false
    },
    deleteGroups(group: IGroup) {
      this.$api.group.delete(group.id).then(() => {
        this.getGroups()
      })
    },
    getGroups() {
      this.$api.group.getPaginated(this.page, this.pageLenght).then((response) => {
        this.groups = response.groups
        let pages = response.total / this.pageLenght
        this.lenght = Math.ceil(pages)
      })
    }
  },
  watch: {
    "page": function () {
      this.getGroups()
    },
    "pageLenght": function () {
      this.getGroups()
    },
  },
});
</script>
  