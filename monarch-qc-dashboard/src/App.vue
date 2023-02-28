<!--
  entry point for entire app
-->
<template>
  <main>
    <div>
      <img src="/src/global/monarch.png" class="logo" alt="Monarch Logo" />
    </div>
    <SimpleDashboard title="Edges vs Dangling Edges" label="provided_by"
      scale="Edges (⚫) vs Dangling Edges (⚪)" :a="edgesTotals" :b="danglingEdgesTotals"/>
    <div align="center">
      Namespaces only in dangling_edges: <br />
      {{ globalNamespaces }}
    </div>
  </main>
</template>

<script setup lang="ts">
  import { globalNamespaces, danglingEdgesTotals, edgesTotals } from "./data";
  import SimpleDashboard from './components/SimpleDashboard.vue'
  // console.log(danglingEdgesTotals)
  // console.log(edgesTotals)
</script>
