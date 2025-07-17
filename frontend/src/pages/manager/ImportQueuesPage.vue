<template>
  <Modal :show="showDialogImport" @close="showDialogImport = false">
    <ModalTitle @close="showDialogImport = false">
      Confirm import
    </ModalTitle>

    <ModalBody>
      <p class="dark:text-white text-left">
        To confirm this action, please type <b>"import queues"</b> in the input field below. This is required to proceed with
        the import.
      </p>
      <fwb-input v-model="confirmAction" class="dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder-neutral-400 dark:text-white">
      </fwb-input>
      <p class="dark:text-white text-left">
        To continue, please enter the password for the admin user.
      </p>
      <fwb-input v-model="password" type="password" class="dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder-neutral-400 dark:text-white">
      </fwb-input>
    </ModalBody>

    <ModalFooter>
      <fwb-button @click="showDialogImport = false" color="dark" class="cursor-pointer">Close</fwb-button>
      <fwb-button @click="importQueues" color="green" :disabled="isImporting" class="mr-2 cursor-pointer">Confirm</fwb-button>
    </ModalFooter>
  </Modal>
  <div class="flex flex-col justify-start gap-6">
    <div class="text-2xl flex items-center justify-start gap-2 py-1">
      <i class="ph ph-queue"></i>
      <span>Import Queues</span>
    </div>

    <div class="grid sm:grid-cols-1 xl:grid-cols-4 gap-4">
      <div class="col-span-4 block p-6 border rounded-lg shadow-sm bg-yellow-300 border-yellow-300">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-black flex items-center gap-2">
          <i class="ph ph-bold ph-warning"></i>
          WARNING: Potentially Intensive Operation
        </h5>
        <p class="font-normal text-black">
          This command initiates a comprehensive scan of the Redis server for queue data.
          Be aware that this operation may consume significant resources and could take considerable time, depending
          on the data size.
          In production environments, such scans should be conducted with caution. Proceed only if you have a thorough
          understanding of the implications and have taken appropriate precautions (e.g., ensuring sufficient resource
          availability, considering off-peak hours).
        </p>
      </div>
      <div class="flex flex-col gap-6 col-span-1">
        <div>
          <Select label="Group*" name="group" v-model="groupId"
            :options="groups.map(g => ({ value: g.id, label: g.name }))" />
        </div>
        <fwb-input v-model="redisHost" label="Redis Host"
          class="dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder-neutral-400 dark:text-white">
        </fwb-input>
        <fwb-input v-model="redisPort" label="Redis Port"
          class="dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder-neutral-400 dark:text-white">
        </fwb-input>
        <fwb-button @click="showDialogImport = true" color="green" class="mr-2 cursor-pointer" :disabled="isImporting">Import queues</fwb-button>
      </div>
    </div>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { Api } from '@/api';
import { FwbInput, FwbButton } from 'flowbite-vue';
import { computed, onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';

import Modal from '@/components/modal/Modal.vue';
import ModalBody from '@/components/modal/ModalBody.vue';
import ModalFooter from '@/components/modal/ModalFooter.vue';
import ModalTitle from '@/components/modal/ModalTitle.vue';
import type { AxiosError } from 'axios';
import type { ErrorRequest } from '@/types';
import type { IGroup } from '@/types/group';
import Select from '@/components/ui/Select.vue';

const api = new Api();

const showDialogImport = ref<boolean>(false);

const IMPORT_TIMEOUT = 5 * 60 * 1000;

const redisHost = ref<string>('');
const redisPort = ref<string>('6379');
const confirmAction = ref<string>();
const password = ref<string>();
const isImporting = ref<boolean>(false);

const groups = ref<IGroup[]>([]);
const selectedGroup = ref<IGroup>();
const groupId = computed({
  get: () => selectedGroup.value?.id || '',
  set: (value: string) => {
    const group = groups.value.find(g => g.id === value);
    if (group) {
      selectedGroup.value = group;
    }
  }
});

onMounted(async () => {
  isImporting.value = loadImportTimeout();
  await fetchGroups();
});

async function fetchGroups() {
  try {
    const response = await api.group.getPaginate();
    groups.value = response.data;
    if (response.data.length > 0) {
      groupId.value = response.data[0].id;
    }
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;

    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  }
}

async function importQueues() {
  try {
    if (confirmAction.value !== 'import queues') {
      toast.warn('Action not allowed, please write <b>import queues</b> into confirm action to disable the action');
      confirmAction.value = '';
      return;
    }

    if (!password.value) {
      toast.warn('Action not allowed, please confirm your user admin password');
      confirmAction.value = '';
      return;
    }

    if (!redisHost.value || !redisPort.value) {
      toast.warn('Please inform all required fields to import the queues');
      confirmAction.value = '';
      return;
    }

    saveImportTimeout();
    setTimeout(() => {
      isImporting.value = loadImportTimeout();
    }, IMPORT_TIMEOUT);

    const queues = await api.queue.importQueues({
      host: redisHost.value,
      port: Number(redisPort.value),
      groupId: groupId.value,
      password: password.value,
    });

    toast.success(`Import finished with ${queues.length} queues`);

    redisHost.value = '';
    redisPort.value = '6379';
    confirmAction.value = '';
    showDialogImport.value = false;
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    localStorage.removeItem('import_timeout');
    isImporting.value = false;
    if (error.response?.status === 403) {
      toast.error('Wrong Authentication');
      return;
    }

    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  }
}

function saveImportTimeout() {
  const now = new Date();
  const expire = new Date(now.getTime() + IMPORT_TIMEOUT);
  localStorage.setItem('import_timeout', expire.toISOString());
  isImporting.value = true;
}

function loadImportTimeout() {
  const stored = localStorage.getItem('import_timeout');
  if (!stored) {
    return false;
  }

  const storedDate = new Date(stored);
  const now = new Date();

  const expired = now < storedDate;

  return expired;
}
</script>
