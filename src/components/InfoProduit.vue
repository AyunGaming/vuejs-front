<template>
    <div v-if="show && product" class="fixed inset-0 flex items-center justify-center z-50"
        style="background-color: rgba(0, 0, 0, 0.5);">
        <div class="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg">
            <button @click="$emit('close')" class="absolute top-2 right-3 text-gray-600 text-xl">&times;</button>

            <img src="../assets/produit_image.jpg" alt="Produit" class="rounded mb-6 w-100 h-50 object-cover" />

            <h2 class="text-2xl font-bold mb-6 text-center">{{ product.name }}</h2>
            <h3 class="text-ml text-black font-bold mb-2">Details :</h3>
            <p class="text-sm text-gray-600 mb-2">Référence : {{ product.ref }}</p>
            <p class="text-sm text-gray-600 mb-2">Catégorie : {{ product.category }}</p>
            <p class="text-sm text-gray-600 mb-2">Unité : {{ product.unit }}</p>
            <p class="text-sm text-gray-600 mb-2">Stock : {{ product.stock }}</p>
            <p class="text-lg font-semibold mt-3 flex justify-end">
                <span>Prix : {{ product.unitPrice.toFixed(2) }} {{ product.currency }}</span>
            </p>
        </div>
    </div>
</template>


<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Product {
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



const props = defineProps<{
    product: Product | null
    show: boolean
}>()

const emits = defineEmits(['close'])
</script>
