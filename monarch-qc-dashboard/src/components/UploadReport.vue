<template>
  <div style="float: right">
    <input type="file" @change="handleFileChange" />
  </div>
</template>

<script setup lang="ts">
  import { Ref, ref } from "vue"
  import { uploadFile } from "./UploadReport"

  const selectedFile: Ref<File | null> = ref(null)

  const handleFileChange = async (event: Event) => {
    if (event && event.target) {
      const target = event.target as HTMLInputElement
      selectedFile.value = target.files?.[0] || null
    }
    if (!selectedFile.value) {
      return
    }
    const currentDate = new Date().toISOString().split("T")[0]
    await uploadFile(selectedFile.value, currentDate)
  }
</script>
