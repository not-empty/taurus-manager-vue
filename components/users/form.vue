<template>
  <v-card>
    <v-form v-model="valid" @submit.prevent="submitForm()">
      <v-card-title>
        <span class="text-h5">User</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field label="Name*" v-model="UserData.name" required></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="12" md="12" lg="12">
              <v-text-field label="Email*" v-model="UserData.email" required></v-text-field>
            </v-col>
            <v-col cols="12" sm="12" md="12" lg="12">
              <v-text-field label="Role*" v-model="UserData.role" required>
              </v-text-field>
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
import { IUser } from "~/types/user";
export default defineComponent({
  name: "QueueForm",
  props: {
    user: {} as PropType<IUser | null>,
  },
  data() {
    return {
      page: 1,
      UserData: {} as IUser,
      valid: true,
    };
  },
  mounted() {
    if (this.user && this.user.id) {
      this.UserData = JSON.parse(JSON.stringify(this.user))
    }
  },
  methods: {
    closeDialog() {
      this.UserData = {
        id: "",
        name: "",
        email: "",
        role: ""
      }
      this.$emit("close")
    },
    submitForm() {
      if (this.user && this.user.id) {
        this.$api.user.edit(this.user.id, this.UserData).then(() => {
          this.closeDialog()
        })

        return
      }

      this.$api.user.post(this.UserData).then(() => {
        this.closeDialog()
      })
    }
  }
});
</script>