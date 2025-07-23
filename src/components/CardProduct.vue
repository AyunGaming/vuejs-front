<template>
  <div class="bg-white p-4 shadow rounded hover:shadow-lg transition-shadow cursor-pointer relative"
    @click="handleCardClick">
    <!-- Contenu produit -->
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center space-x-2 max-w-[60%]">
        <h3 class="font-bold text-lg whitespace-nowrap overflow-hidden text-ellipsis" :title="product.name">{{ product.name }}</h3>
        <div v-if="authStore.isAdmin" class="flex space-x-1">
          <button @click.stop="$emit('edit', product)" class="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button @click.stop="$emit('delete', product)" class="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
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
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

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


const emit = defineEmits(['open-info', 'edit', 'delete'])

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