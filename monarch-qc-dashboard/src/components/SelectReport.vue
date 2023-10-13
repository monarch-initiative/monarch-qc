<!--
  This component is a dropdown menu that allows the user to select a report to view.
  It is a child component of the Dashboard component.
 -->

<template>
  <div style="float: right">
    <label style="font-weight: bold; font-size: large; padding-right: 1em"
      >{{ label }}
      <select
        :id="id"
        :value="modelValue"
        @change="selectChange"
        :style="{ padding: '0.5rem', borderRadius: '0.25rem' }"
      >
        <option v-for="reportName in reportNames" :key="reportName" :value="reportName">
          {{ reportName }}
        </option>
      </select>
    </label>
  </div>
</template>

<script setup lang="ts">
  const { onChange, modelValue } = defineProps<{
    id: string
    label: string
    reportNames: string[]
    modelValue: string
    onChange: () => void
  }>()

  const emit = defineEmits(["update:modelValue"])
  const selectChange = (event: Event) => {
    emit("update:modelValue", (event.target as HTMLSelectElement)?.value)
    if (onChange) {
      onChange()
    }
  }
</script>
