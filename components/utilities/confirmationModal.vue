<template>
  <v-dialog v-model="isActive" max-width="400px">
    <v-card class="py-3">
      <v-card-title>
        <h4>{{ message }}</h4>
      </v-card-title>
      <v-card-actions class="d-flex justify-end">
        <v-btn text color="secondary" @click="$emit('close')">
          Cancel
        </v-btn>
        <v-btn text color="secondary" @click="confirm()">
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    state: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      required: true
    },
    function: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      isActive: false
    };
  },
  watch: {
    state (n: boolean) {
      this.isActive = n;
    }
  },
  methods: {
    confirm () {
      this.$emit('close');
      this.function();
    }
  }
});
</script>
