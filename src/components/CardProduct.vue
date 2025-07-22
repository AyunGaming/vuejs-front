<template>
  <div class="bg-white p-4 shadow rounded hover:shadow-lg transition-shadow cursor-pointer relative"
    @click="handleCardClick">
    <!-- Contenu produit -->
    <div class="flex justify-between mb-2">
      <h3 class="font-bold text-lg">{{ product.name }}</h3>
      <p class="text-indigo-600 font-semibold">{{ product.unitPrice }} {{ product.currency }}</p>
    </div>
    <p class="text-gray-600 mb-2">Référence : {{ product.ref }}</p>
    <div class="absolute bottom-2 right-4 text-sm text-indigo-600 hover:underline" @click="handleCardClick">
      Voir plus de détails
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  product: {
    _id: string
    name: string
    ref: string
    category: string
    unit: string
    currency: string
    unitPrice: number
    billingFrequency?: string
    stock: number
  }
}>()


const emit = defineEmits(['open-info'])

const showModal = ref(false)


function handleCardClick() {
  if (!showModal.value) {
    emit('open-info', {
      _id: props.product._id,
      name: props.product.name,
      ref: props.product.ref,
      category: props.product.category,
      unitPrice: props.product.unitPrice,
      currency: props.product.currency,
      unit: props.product.unit,
      stock: props.product.stock,
    })
  }
}

</script>