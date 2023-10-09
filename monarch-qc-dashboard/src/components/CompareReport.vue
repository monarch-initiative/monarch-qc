<!--
  This component is a dropdown menu that allows the user to change a comparison report.
  It is a child component of the Dashboard component.
 -->

<template>
  <div style="float: right">
    <label style="font-weight: bold; font-size: large; padding-right: 1em">Compare to:</label>
    <select v-model="selectedCompareReport" :style="{ padding: '0.5rem', borderRadius: '0.25rem' }">
      <option v-for="name in reportNames" :key="name" :value="name">
        {{ name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
  import { watch } from "vue"
  import { processReport } from "../data"
  import { selectedCompareReport } from "../data"

  defineProps<{
    reportNames: string[]
    selectedReport: string
  }>()

  watch(selectedCompareReport, async () => {
    await processReport()
  })
</script>
