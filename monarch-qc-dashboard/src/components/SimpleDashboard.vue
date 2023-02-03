<template>
  <div align="left">
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(value) of globalTotals">
          <td>{{ value[0] }}</td>
          <td>{{ value[1] }}</td>
        </tr>
      </tbody>
    </table>
    Namespaces only in dangling_edges:
    {{ globalNamespaces }}
  </div>
</template>
  
<script setup lang="ts">
import { globalNamespaces, globalData, globalTotals } from "../data";
</script>
