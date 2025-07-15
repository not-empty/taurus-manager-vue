<template>
  <nav class="flex items-center flex-column flex-wrap md:flex-row justify-end pt-4" aria-label="Table navigation">
    <ul class="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
        <li>
            <a href="#" @click="onChangePage(page - 1)" class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-neutral-500 bg-white border border-neutral-300 rounded-s-lg hover:bg-neutral-100 hover:text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white">Previous</a>
        </li>
        <li v-for="p in visiblePages" :key="p.key" class="page-item">
          <a href="#" v-if="p.type === 'ellipsis'" :class="['page-link', p.number === page ? 'active' : '']" @click="onChangePage(Number(p.number || 1))" class="flex items-center justify-center px-3 h-8 leading-tight text-neutral-500 bg-white border border-neutral-300 hover:bg-neutral-100 hover:text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white">
            ...
          </a>
          <a
            v-else 
            href="#"
            @click="onChangePage(Number(p.number || 1))"
            :class="[
              'flex items-center justify-center px-3 h-8 leading-tight',
              p.number === page ? 'text-blue-600 border border-neutral-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-neutral-700 dark:bg-neutral-700 dark:text-white' : 'text-neutral-500 bg-white border border-neutral-300 hover:bg-neutral-100 hover:text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white',
            ]"
          >
            {{ p.number }}
          </a>
        </li>
        <li>
          <a href="#" @click="onChangePage(page + 1)" class="flex items-center justify-center px-3 h-8 leading-tight text-neutral-500 bg-white border border-neutral-300 rounded-e-lg hover:bg-neutral-100 hover:text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white">Next</a>
        </li>
    </ul>
</nav>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch, computed } from 'vue';

interface Props {
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
  maxVisiblePages?: number;
  onLoadData: (page: number) => void;
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5,
});

const totalPages = ref(2);

watch([
  () => props.rowsNumber,
  () => props.rowsPerPage,
], ([rowsNumber, rowsPerPage]) => {
  totalPages.value = Math.ceil(rowsNumber / rowsPerPage);
})

onMounted(() => {
  totalPages.value = Math.ceil(props.rowsNumber / props.rowsPerPage) || 1;
})

function onChangePage(page: number) {
  if (!props.onLoadData) return;

  if (page < 1) return props.onLoadData(1);
  if (page > totalPages.value) return props.onLoadData(totalPages.value);

  props.onLoadData(page);
}

const visiblePages = computed(() => {
  const max = props.maxVisiblePages;
  const pages = totalPages.value;
  const current = props.page;

  if (pages <= max) {
    return Array.from({ length: pages }, (_, i) => ({
      type: 'page',
      number: i + 1,
      key: i + 1,
    }));
  }

  const result: { type: 'page' | 'ellipsis', number?: number, key: string | number }[] = [];

  const middle = Math.floor(max / 2);
  let start = Math.max(2, current - middle);
  let end = Math.min(pages - 1, current + middle);

  if (current <= middle) {
    start = 2;
    end = max - 1;
  }

  if (current >= pages - middle) {
    start = pages - max + 2;
    end = pages - 1;
  }

  result.push({ type: 'page', number: 1, key: 1 });

  if (start > 2) {
    result.push({ type: 'ellipsis', key: 'start-ellipsis' });
  }

  for (let i = start; i <= end; i++) {
    result.push({ type: 'page', number: i, key: i });
  }

  if (end < pages - 1) {
    result.push({ type: 'ellipsis', key: 'end-ellipsis' });
  }

  result.push({ type: 'page', number: pages, key: pages });

  return result;
});
</script>
