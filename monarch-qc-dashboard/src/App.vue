<!--
  entry point for entire app
-->
<template>
  <main>
    <div>
      <img src="/src/global/monarch.png" class="logo" alt="Monarch Logo" />
    </div>
    <SimpleDashboard msg="Visualization of Edges vs Dangling Edges by provider" :totals="globalTotals" />
    <div align="center">
      Namespaces only in dangling_edges: <br />
      {{ globalNamespaces }}
    </div>
  </main>
</template>

<script setup lang="ts">
  import { globalNamespaces, globalData, globalTotals } from "./data";
  import SimpleDashboard from './components/SimpleDashboard.vue'
</script>
