<template>
  <div class="bg-white p-4 shadow rounded hover:shadow-lg transition-shadow cursor-pointer">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold text-lg">{{ name }}</h3>
      <p class="text-indigo-600 font-semibold">{{ unitPrice }} {{ currency }}</p>
    </div>
    <p class="text-gray-600">Référence : {{ productRef }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  productRef: string
  unitPrice: number
  currency: string
}>()
</script>
