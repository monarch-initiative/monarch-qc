<template>
  <h1> {{ title }}</h1>
  <div align="center">
    <table>
      <thead>
        <tr>
          <th>{{ label }}</th>
          <th>{{ scale }}</th>
        </tr>
      </thead>
      <tbody>
        <!-- <tr v-for="[key, value] of totals.entries()">
          <td>{{ key }}</td>
          <td align="center">{{ value }}</td>
        </tr> -->
        <tr v-for="[key, value] of getVisualDiffs(a, b)">
          <td>{{ key }}</td>
          <td align="center">{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
  
<script setup lang="ts">
  import { getVisualDiffs } from './SimpleDashboard'
defineProps<{ title: string, label: string, scale: string, a: Map<string, number>, b: Map<string, number> }>()
</script>
