<template>
  <v-card>
    <v-form v-model="valid" @submit.prevent="submitForm()">
      <v-card-title>
        <span class="text-h5">Create job</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="12" lg="12">
              <v-textarea label="Data" rows="1" auto-grow v-model="jobData.data"></v-textarea>
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
import { defineComponent } from "vue";
import { IJobPayload } from '../../types/job';
export default defineComponent({
  name: "JobForm",
  props: {
    queueId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      page: 1,
      jobData: {
        data: ''
      },
      valid: true,
    };
  },
  methods: {
    closeDialog() {
      this.$emit("close")
    },
    submitForm() {
      try{
        this.jobData.data = JSON.parse(this.jobData.data);
      } catch (e) {
        alert('Data isn`t a valid json');
        return;
      }
      
      this.$api.jobs.createJob(this.queueId, {data: this.jobData}).then(() => {
        this.$emit("close")
      })
    }
  }
});
</script>