<template>
  <v-dialog v-model="state" max-width="400px">
    <v-card class="py-3">
      <v-card-title>
        <h4>{{ mensage }}</h4>
      </v-card-title>
      <v-card-actions class="d-flex justify-end">
        <v-btn text color="secondary" @click="$emit('close')">cancelar</v-btn>
        <v-btn text color="secondary" @click="confirm()">confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    state: Boolean,
    mensage: {
      type: String,
      required: true
    },
    function: {
      type: Function,
      required: true
    }
  },
  data() {
    return {

    }
  },
  methods: {
    confirm() {
      this.$emit('close');
      this.function()
    },
  }
})
</script>