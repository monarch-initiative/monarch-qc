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
        <tr v-for="[key, value] of totals.entries()">
          <td>{{ key }}</td>
          <td align="center">{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ title: string, label: string, scale: string, totals: Map<string, string> }>()

</script>
