<!--
  entry point for entire app
-->
<template>
  <main>
    <div>
      <img src="./global/monarch.png" class="logo" alt="Monarch Logo" />
    </div>
    <MonarchQCTest msg="Monarch QC Testing" />
  </main>
</template>

<script setup lang="ts">
  import { allNamespaces, globalData } from "./data";
  import MonarchQCTest from './components/MonarchQCTest.vue'
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
