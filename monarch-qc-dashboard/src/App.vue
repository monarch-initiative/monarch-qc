<!--
  entry point for entire app
-->
<template>
  <main>
    <div>
      <img src="./global/monarch.png" class="logo" alt="Monarch Logo" />
    </div>
    <MonarchQCTest msg="Monarch QC Testing" />
    <SimpleDashboard msg="Monarch Simple QC" />
    <div align="center">
      Namespaces only in dangling_edges: <br />
      {{ globalNamespaces }}
    </div>
  </main>
</template>

<script setup lang="ts">
  import { globalNamespaces, globalData, globalTotals } from "./data";
  import MonarchQCTest from './components/MonarchQCTest.vue'
  import SimpleDashboard from './components/SimpleDashboard.vue'
</script>
