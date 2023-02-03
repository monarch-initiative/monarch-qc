<template>
  <div align="left">
    <table>
      <thead>
        <tr>
          <th>provided_by</th>
          <th>Edges (⚫) vs Dangling Edges (⚪)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(value) of globalTotals">
          <td>{{ value[0] }}</td>
          <td align="right">{{ value[1] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
  
<script setup lang="ts">
import { globalNamespaces, globalData, globalTotals } from "../data";
</script>
