<template>
  <v-card>
    <v-form ref="userForm" v-model="valid" @submit.prevent="submitForm()">
      <v-card-title>
        <span class="text-h5">User</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="UserData.name"
                label="Name*"
                required
                :rules="stringRules"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="12" md="12" lg="12">
              <v-text-field
                v-model="UserData.email"
                label="Email*"
                :rules="emailRules"
                required
              />
            </v-col>
            <v-col cols="12" sm="12" md="12" lg="12">
              <v-select
                v-model="UserData.role"
                label="Role*"
                :items="roleItems"
                required
              />
            </v-col>
            <v-col cols="12" sm="12" md="12" lg="12">
              <v-select
                v-model="UserData.groupIds"
                :items="GroupsData"
                :rules="groupsRules"
                label="Groups*"
                multiple
                item-text="name"
                item-value="id"
              />
            </v-col>
            <v-col cols="12" sm="12" md="12" lg="12">
              <v-text-field
                v-model="UserData.password"
                label="Senha*"
                required
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="showPassword = !showPassword"
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
import { IGroup } from '~/types/group';
import { IUser } from '~/types/user';

export default defineComponent({
  name: 'UserForm',
  props: {
    user: {
      type: Object as PropType<IUser | null>,
      default: () => ({})
    }
  },
  data () {
    return {
      page: 1,
      UserData: {} as IUser,
      GroupsData: [] as IGroup[],
      valid: false,
      roleItems: [
        'administrator',
        'Controller',
        'Guest'
      ],
      emailRules: [
        (v: string) => Boolean(v) || 'E-mail is required',
        (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ],
      groupsRules: [
        (v: string[]) => Boolean(v.length) || 'Groups is required'
      ],
      stringRules: [
        (v: string) => Boolean(v) || 'Name is required'
      ],
      showPassword: false
    };
  },
  computed: {
    passwordRules: function () {
      return [
        (v: string) => this.validateIfNeedPassword(v)
      ];
    }
  },
  async created () {
    const { groups } = await this.$api.group.getPaginated(1, 1000);
    this.GroupsData = groups;
  },
  async mounted () {
    if (this.user && this.user.id) {
      this.UserData = await this.$api.user.getById(this.user.id);
      return;
    }

    this.UserData.password = '1doc@2023';
  },
  methods: {
    closeDialog () {
      this.UserData = {
        id: '',
        name: '',
        email: '',
        role: '',
        groups: [],
        groupIds: []
      };
      this.$emit('close');
    },
    submitForm () {
      delete this.UserData.groups;
      if (!this.valid) {
        return;
      }
      if (this.user && this.user.id) {
        this.$api.user.edit(this.user.id, this.UserData).then(() => {
          this.closeDialog();
        });

        return;
      }

      this.$api.user.post(this.UserData).then(() => {
        this.closeDialog();
      });
    },
    validateIfNeedPassword (password: string): boolean | string {
      if (this.user && this.user.id) {
        return true;
      }
      if (!password) {
        return 'Password is required';
      }
      if (password.length < 8) {
        return 'Password need at least eight caracters';
      }
      return true;
    }
  }
});
</script>
