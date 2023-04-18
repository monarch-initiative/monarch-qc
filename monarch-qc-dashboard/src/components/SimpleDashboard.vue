<!-- 
  This component is a simple dashboard that displays a table of values
  for two different data sets. The data sets are passed in as props.
  The component is used to display the results of the visual diff
  algorithm.
 -->
<template>
  <h1>{{ title }}</h1>
  <div align="center">
    <table>
      <thead>
        <tr>
          <th>{{ label }}</th>
          <th style="padding-right: 10px">{{ a_name }} (⚫) vs {{ b_name }} (⚪)</th>
          <th align="right" style="padding-right: 10px">{{ a_name }}</th>
          <th align="right">{{ b_name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="([key, value], index) of getVisualDiffs(a, b)"
          :key="key"
          :style="index % 2 === 0 ? 'background-color: #f2f2f2;' : 'background-color: #ffffff;'"
        >
          <td>{{ key }}</td>
          <td align="center">{{ value }}</td>
          <td align="center" style="padding-right: 10px">
            {{ (a.get(key) ?? 0).toLocaleString("en-US") }}
          </td>
          <td align="center" style="padding-left: 10px">
            {{ (b.get(key) ?? 0).toLocaleString("en-US") }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
  import { getVisualDiffs } from "./SimpleDashboard"
  defineProps<{
    title: string
    label: string
    a_name: string
    b_name: string
    a: Map<string, number>
    b: Map<string, number>
  }>()
</script>
