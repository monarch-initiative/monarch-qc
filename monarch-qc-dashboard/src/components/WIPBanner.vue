<!--
  checkbox with arbitrary content (slot) and icon
-->

<template>
  <aside class="banner">
    <div>
      This web app is a <strong>WORK IN PROGRESS</strong> 
      with ongoing development.
    </div>
    <button type="button" @click="open = false">Close</button>
  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";

const open = ref(true);
</script>

<style lang="scss" scoped>
.banner {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  text-align: center;
}
</style>
