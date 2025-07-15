<template>
  <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white">
    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-900 dark:text-white">
      <tr>
        <th v-if="selectable && data.length > 0" class="px-6 py-3">
          <input type="checkbox" :checked="isAllSelected" @change="toggleAll" class="cursor-pointer" />
        </th>
        <th v-for="column of columns" :key="column.name" scope="col" class="px-6 py-3">
          <div class="flex items-center gap-1">
            <i v-if="column.icon" :class="['ph text-xl', `ph-${column.icon}`]"> </i>
            {{ column.label }}
          </div>
        </th>
        <th v-if="actions && actions.length > 0" scope="col" class="px-6 py-3">
          <span>Actions</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-if="data.length > 0">
        <tr v-for="(row, index) in data" :key="index" :class="[
          'bg-white dark:bg-neutral-800 dark:border-neutral-700 border-gray-200 hover:bg-gray-50 border-b-1 dark:hover:bg-neutral-700',
          applyRowClass ? applyRowClass(row) : ''
        ]" @click="(e) => {
          if (!onRowClick) return;
          e.preventDefault();
          e.stopPropagation();
          onRowClick(row);
        }">
          <td v-if="selectable" @click.stop class="px-6 py-4">
            <input type="checkbox" :checked="isSelected(row)" @change="() => toggleRow(row)" class="cursor-pointer" />
          </td>

          <td scope="row" v-for="column of columns" :key="column.name" :class="[
            'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white',
            column.class,
            onRowClick ? 'cursor-pointer' : ''
          ]" style="color: inherit !important; background-color: inherit !important;" @click="(e) => {
            if (!column.onClick) return;

            e.preventDefault();
            e.stopPropagation();
            column.onClick(row);
          }">
            <slot :name="`body-cell-${column.name}`" :row="row" :column="column">
              <div v-if="column.isHtml" v-html="getColumnValue(row, column)"></div>
              <a v-else-if="column.isLink" href="javascript:void(0)">
                {{ getColumnValue(row, column) }}
              </a>
              <div v-else>
                {{ getColumnValue(row, column) }}
              </div>
            </slot>
          </td>

          <td v-if="actions && actions.length > 0" class="shadow-none lh-1 fw-medium text-body-tertiary text-start px-6"
            style="color: inherit !important; background-color: inherit !important;">
            <template v-for="action of actions" :key="action.name">
              <button v-if="!action.hide || !action.hide(row)" type="button"
                class="text-blue-700 cursor-pointer border border-blue-700 hover:bg-blue-700 hover:text-white font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:border-neutral-500 dark:text-neutral-500 dark:hover:text-white dark:hover:bg-neutral-500"
                @click="(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  action.onClick(row, index);
                }" :disabled="action.disable && action.disable(row)">
                <i :class="['ph-fill', `ph-${action.icon}`]"></i>
                <span class="sr-only">{{ action.label }}</span>
              </button>
            </template>
          </td>
        </tr>
      </template>
      <template v-else>
        <tr
          class="bg-white dark:bg-neutral-800 dark:border-neutral-700 border-gray-200 hover:bg-gray-50 border-b-1 dark:hover:bg-neutral-700">
          <td scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            :colspan="columns.length" style="color: inherit !important; background-color: inherit !important;">
            No data available
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

export interface TableColumn<T> {
  name: string;
  align: string;
  label: string;
  sortable?: boolean;
  isHtml?: boolean;
  isLink?: boolean;
  class?: string;
  icon?: string;
  onClick?: (row: T) => void;
  field: (keyof T) | ((row: T) => string);
}

export interface TableAction<T> {
  name: string;
  icon: string;
  label: string;
  onClick: (row: T, index: number) => void;
  disable?: (row: T) => boolean;
  hide?: (row: T) => boolean;
}

export interface Props<T> {
  data: T[];
  onRowClick?: (row: T) => void;
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  onSelect?: (rows: T[]) => void;
  applyRowClass?: (row: T) => string;
  selectable?: boolean;
}

const props = withDefaults(defineProps<Props<any>>(), {
  selectable: false,
});

const emit = defineEmits<{
  (e: 'update:selected', rows: any[]): void;
}>();

const selectedRows = ref<any[]>([]);

defineExpose({
  clearSelection,
});

const toggleRow = (row: any) => {
  const index = selectedRows.value.indexOf(row);
  if (index > -1) {
    selectedRows.value.splice(index, 1);
  } else {
    selectedRows.value.push(row);
  }
};

const isSelected = (row: any) => selectedRows.value.includes(row);

const toggleAll = () => {
  if (selectedRows.value.length === props.data.length) {
    selectedRows.value = [];
  } else {
    selectedRows.value = [...props.data];
  }
};

const isAllSelected = computed(() => selectedRows.value.length === props.data.length && props.data.length > 0);

watch(selectedRows, (val) => {
  if (props.selectable) {
    emit('update:selected', val);
  }
}, { deep: true, immediate: true });

function getColumnValue<T>(row: T, column: TableColumn<T>) {
  if (typeof column.field === 'string') {
    return row[column.field] ?? '';
  }
  if (typeof column.field === 'function') {
    return column.field(row);
  }
  return '';
}

function clearSelection() {
  selectedRows.value = [];
}
</script>
