<!--
  This component is a simple dashboard that displays a table of values
  for two different data sets. The data sets are passed in as props.
  The component is used to display the results of the visual diff
  algorithm.
 -->
<template>
  <div align="center">
    <table>
      <thead>
        <tr>
          <th>{{ label }}</th>
          <template v-for="field in field_labels" :key="field">
            <th>{{ titleFormat(field) }}</th>
            <template style="text-align: center" v-if="getNextField(field, field_labels) !== null">
              <th style="text-align: center; padding: 0 10px 0 10px">
                <span style="margin-right: 3ch">(⚫)</span> vs
                <span style="margin-left: 3ch">(⚪)</span>
              </th>
            </template>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(label, index) in labels" :key="label" :style="getRowStyle(index)">
          <td>{{ label }}</td>
          <template v-for="field in fields" :key="field">
            <td style="padding: 0 10px 0 10px">
              <!-- Show as link to missing nodes page if this is a dangling_edges field -->
              <template v-if="field === 'dangling_edges' && label !== 'Total Number'">
                <a 
                  href="#" 
                  @click.prevent="navigateToMissingNodes(label)"
                  class="missing-nodes-link"
                >
                  {{ (data[field].value.get(label) ?? 0).toLocaleString("en-US") }}
                </a>
              </template>
              <template v-else>
                {{ (data[field].value.get(label) ?? 0).toLocaleString("en-US") }}
              </template>
              
              <template v-if="colorCols.includes(field)">
                <span
                  v-if="data[field].diff.has(label) && (data[field].diff.get(label) ?? 0) > 0"
                  style="color: green; font-style: italic"
                >
                  (+{{ data[field].diff.get(label)?.toLocaleString("en-US") }})
                </span>
                <span
                  v-if="data[field].diff.has(label) && (data[field].diff.get(label) ?? 0) < 0"
                  style="color: red; font-weight: bold"
                >
                  ({{ data[field].diff.get(label)?.toLocaleString("en-US") }})
                </span>
              </template>
              <template v-if="!colorCols.includes(field)">
                <span v-if="data[field].diff.has(label) && (data[field].diff.get(label) ?? 0) > 0">
                  (+{{ data[field].diff.get(label)?.toLocaleString("en-US") }})
                </span>
                <span v-if="data[field].diff.has(label) && (data[field].diff.get(label) ?? 0) < 0">
                  ({{ data[field].diff.get(label)?.toLocaleString("en-US") }})
                </span>
              </template>
            </td>
            <template v-if="getNextField(field, data) !== null"></template>
            <td style="padding: 0 10px 0 10px">{{ visualDiffs.get(field)?.get(label) }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
  import { DashboardData, getAllVisualDiffs, getDataLabels, getNextField } from "./SimpleDashboard"
  import { getRowStyle, titleFormat } from "../style"
  import { computed } from "vue"
  
  const emit = defineEmits(['navigate-to-missing-nodes']);
  
  const { data, field_names } = defineProps<{
    title: string
    label: string
    colorCols: string[]
    data: DashboardData
    field_names?: string[]
  }>()
  
  const fields = computed(() => Object.keys(data))
  const field_labels = computed(() => field_names ?? fields.value)
  const labels = computed(() => getDataLabels(data))
  const visualDiffs = computed(() => getAllVisualDiffs(data))
  
  // Function to navigate to missing nodes page with the selected ingest
  function navigateToMissingNodes(ingest: string) {
    emit('navigate-to-missing-nodes', ingest);
  }
</script>

<style>
.missing-nodes-link {
  color: #3399cc;
  text-decoration: none;
  cursor: pointer;
}

.missing-nodes-link:hover {
  text-decoration: none;
}
</style>
