<template>
  <div class="bg-white p-4 shadow rounded hover:shadow-lg transition-shadow cursor-pointer relative"  @click="handleCardClick" >
    <!-- Contenu produit -->
    <div class="flex justify-between mb-2">
      <h3 class="font-bold text-lg">{{ product.name }}</h3>
      <p class="text-indigo-600 font-semibold">{{ product.unitPrice }} {{ product.currency }}</p>
    </div>
    <p class="text-gray-600 mb-2">Référence : {{ product.ref }}</p>

    <!-- Bouton Ajouter au panier -->
    <div class="flex justify-end">
      <button v-if="isLoggedIn" @click.stop="openQuantityModal"
        class="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
        Ajouter au panier
      </button>
    </div>

    <!-- Modale Quantité -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style="background-color: rgba(0, 0, 0, 0.5);">
      <div class="bg-white p-6 rounded shadow-lg w-80 relative">
        <button @click.stop="closeQuantityModal"
          class="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold">&times;</button>

        <h3 class="text-lg font-semibold mb-4">Choisissez la quantité</h3>

        <div class="flex items-center justify-center space-x-4 mb-4">
          <button @click="decrement" class="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400">-</button>
          <input type="number" v-model.number="quantity" min="1" :max="maxQuantity"
            class="w-16 text-center border rounded" />
          <button @click="increment" class="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400">+</button>
        </div>

        <p class="text-sm text-gray-500 mb-4">Stock disponible : {{ maxQuantity }}</p>

        <button @click.stop="confirmAddToCart"
          class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          :disabled="quantity < 1 || quantity > maxQuantity">
          Ajouter {{ quantity }} au panier
        </button>
      </div>
    </div>

    <!-- Message de succès -->
    <transition name="fade">
      <div v-if="showSuccessMessage"
        class="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-60">
        Produit ajouté au panier ! 🎉
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'

const props = defineProps<{
   product: {
    _id: string
    name: string
    ref: string
    category: string
    unitPrice: number
    currency: string
    unit: string
    stock: number
  }
}>()

const emit = defineEmits(['open-info'])
const cartStore = useCartStore()
const authStore = useAuthStore()
const isLoggedIn = authStore.isLoggedIn

const showModal = ref(false)
const quantity = ref(1)
const maxQuantity = props.product.stock

const showSuccessMessage = ref(false)

function openQuantityModal() {
  quantity.value = 1
  showModal.value = true
}

function closeQuantityModal() {
  showModal.value = false
}

function increment() {
  if (quantity.value < maxQuantity) {
    quantity.value++
  }
}

function decrement() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function confirmAddToCart() {
  cartStore.addToCart({
    id: props.product._id,
    name: props.product.name,
    price: props.product.unitPrice,
    quantity: quantity.value,
  })

  closeQuantityModal()
  showSuccess()
}

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
    })
  }
}

function showSuccess() {
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 2500)
}
</script>