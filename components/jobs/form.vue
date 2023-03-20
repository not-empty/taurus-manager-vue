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
              <v-textarea v-model="jobData" label="Data" rows="1" auto-grow />
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
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'JobForm',
  props: {
    queueId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      page: 1,
      jobData: '',
      valid: false
    };
  },
  methods: {
    closeDialog () {
      this.$emit('close');
    },
    submitForm () {
      if (!this.valid) {
        return;
      }
      let jobDataJson = {};
      try {
        jobDataJson = JSON.parse(this.jobData);
      } catch (e) {
        alert('Data isn`t a valid json');
        return;
      }

      this.$api.jobs.createJob(this.queueId, jobDataJson).then(() => {
        this.$emit('close');
      });
    }
  }
});
</script>
