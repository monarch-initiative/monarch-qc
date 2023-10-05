<!--
  This component is a simple dashboard that displays a table of values
  for two different data sets. The data sets are passed in as props.
  The component is used to display the results of the visual diff
  algorithm.
 -->
<template>
  <h2>{{ title }}</h2>
  <div align="center">
    <table>
      <thead>
        <tr>
          <th>{{ label }}</th>
          <th style="padding-right: 10px">{{ a_name }}</th>
          <th style="padding-right: 10px">{{ a_name }} (⚫) vs {{ b_name }} (⚪)</th>
          <th>{{ b_name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="([key, value], index) of getVisualDiffs(a, b)"
          :key="key"
          :style="getRowStyle(index)"
        >
          <td>{{ key }}</td>
          <td style="padding-right: 10px">
            {{ (a.get(key) ?? 0).toLocaleString("en-US") }}
            <span
              v-if="a_diff.has(key) && (a_diff.get(key) ?? 0) > 0"
              style="color: green; font-style: italic"
            >
              (+{{ a_diff.get(key)?.toLocaleString("en-US") }})
            </span>
            <span
              v-if="a_diff.has(key) && (a_diff.get(key) ?? 0) < 0"
              style="color: red; font-weight: bold"
            >
              ({{ a_diff.get(key)?.toLocaleString("en-US") }})
            </span>
          </td>
          <td style="text-align: center">{{ value }}</td>
          <td style="padding-left: 10px">
            {{ (b.get(key) ?? 0).toLocaleString("en-US") }}
            <span v-if="b_diff.has(key) && (b_diff.get(key) ?? 0) > 0">
              (+{{ b_diff.get(key)?.toLocaleString("en-US") }})
            </span>
            <span v-if="b_diff.has(key) && (b_diff.get(key) ?? 0) < 0">
              ({{ b_diff.get(key)?.toLocaleString("en-US") }})
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
  import { getVisualDiffs } from "./SimpleDashboard"
  import { getStateSummary } from "./SimpleDashboard"
  import { getRowStyle } from "../style"
  defineProps<{
    title: string
    label: string
    a_name: string
    b_name: string
    a: Map<string, number>
    b: Map<string, number>
    a_diff: Map<string, number>
    b_diff: Map<string, number>
  }>()
</script>
