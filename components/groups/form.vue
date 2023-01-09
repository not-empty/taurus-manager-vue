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
                v-model="groupData.name"
                label="Name*"
                required
                :rules="stringRule('Name')"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="12" lg="12">
              <v-textarea
                v-model="groupData.description"
                label="Description"
                rows="1"
                auto-grow
              />
            </v-col>
          </v-row>
        </v-container>
        <small>*Required</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="secondary" text @click="closeDialog()">
          Close
        </v-btn>
        <v-btn color="secondary" text type="submit">
          Save
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { GroupPayload, IGroup } from '~/types/group';
export default defineComponent({
  name: 'GroupForm',
  props: {
    group: {
      type: Object as PropType<IGroup | null>,
      default: () => ({})
    }
  },
  data () {
    return {
      page: 1,
      groups: [] as IGroup[],
      groupData: {} as GroupPayload,
      valid: false,
      stringRule: (name: string) => [
        (v: string) => !!v || `${name} is required`
      ]
    };
  },
  mounted () {
    this.getGroups(1);
    if (this.group && this.group.id) {
      this.groupData = JSON.parse(JSON.stringify(this.group));
    }
  },
  methods: {
    closeDialog () {
      this.groupData = {
        name: '',
        description: ''
      };
      this.$emit('close');
    },
    getGroups (page: number) {
      this.$api.group.getPaginated(page, 25).then((response) => {
        this.groups.push(...response.groups);
        this.page = page;
      });
    },
    submitForm () {
      if (!this.valid) {
        return;
      }
      if (this.group && this.group.id) {
        this.$api.group.edit(this.group.id, this.groupData).then(() => {
          this.closeDialog();
        });

        return;
      }

      this.$api.group.create(this.groupData).then(() => {
        this.closeDialog();
      });
    }
  }
});
</script>
