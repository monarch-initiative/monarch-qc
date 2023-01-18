<!--
  entry point for entire app
-->
<template>
  <main>
    {{ globalData }}
  </main>
</template>


<script setup lang="ts">
import { globalData } from "./data";
import TheBanner from "./components/TheBanner.vue"
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
