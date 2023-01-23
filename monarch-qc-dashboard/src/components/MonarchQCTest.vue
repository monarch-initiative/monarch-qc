<script setup lang="ts">
  import { ref } from 'vue'
  defineProps<{ msg: string }>()
  const count = ref(0)

  import { allNamespaces, globalData } from "../data";
</script>

<template>
  <h1>{{ msg }}</h1>
  <p>
    This is an initial test framework for creating the Monarch QC Dashboard.
    {{ allNamespaces }}
  </p>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/MonarchQCTest.vue</code> to test HMR
    </p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
