<template>
    <v-card>
      <v-form v-model="valid" @submit.prevent="submitForm()">
        <v-card-title>
          <span class="text-h5">Queue</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" lg="12">
                <v-text-field
                  label="Name*"
                  v-model="groupData.name"
                  required
                  :rules="stringRule('Name')"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="12" lg="12">
                <v-textarea
                  label="Description"
                  rows="1"
                  auto-grow
                  v-model="groupData.description"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
          <small>*Required</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog()">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text type="submit">
            Save
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </template>

  <script lang="ts">
  import { defineComponent, PropType } from "vue";
  import { GroupPayload, IGroup } from "~/types/group";
  export default defineComponent({
    name: "GroupForm",
    props: {
      group: {} as PropType<IGroup | null>,
    },
    data() {
      return {
        page: 1,
        groups: [] as IGroup[],
        groupData: {} as GroupPayload,
        valid: true,
        stringRule: (name: string) => [(v: string) => !!v || `${name} is required`],
      };
    },
    mounted() {
      this.getGroups(1)
      if (this.group && this.group.id) {
        this.groupData = JSON.parse(JSON.stringify(this.group))
      }
    },
    methods: {
      closeDialog() {
        this.groupData = {
            name: '',
            description: '',
        }
        this.$emit("close")
      },
      getGroups(page: number) {
        this.$api.group.getPaginated(page, 25).then((response) => {
          this.groups.push(...response.groups)
          this.page = page
        })
      },
      submitForm() {
        if (this.group && this.group.id) {
          this.$api.group.edit(this.group.id, this.groupData).then(() => {
            this.closeDialog()
          })

          return
        }

        this.$api.group.create(this.groupData).then(() => {
          this.closeDialog()
        })
      }
    }
  });
  </script>
