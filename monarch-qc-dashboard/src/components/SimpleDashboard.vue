<template>
    <div align="left">
      <ul>
        <li v-for="(value) of globalTotals">
          {{ value[0] }} : <div align="right">{{  value[1] }}</div>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup lang="ts">
  import { globalNamespaces, globalData, globalTotals } from "../data";
</script>
  