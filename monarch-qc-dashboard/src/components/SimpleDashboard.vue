<template>
  <h1> {{ msg }}</h1>
  <div align="center">
    <table>
      <thead>
        <tr>
          <th>provided_by</th>
          <th>Edges (⚫) vs Dangling Edges (⚪)</th>
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
defineProps<{ msg: string, totals: Map<string, string> }>()
</script>
