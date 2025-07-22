<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Liste des produits</h1>

      <button v-if="authStore.isAdmin" @click="openForm"
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        Ajouter un produit
      </button>
    </div>

    <div v-if="showAddForm" class="fixed inset-0 flex items-center justify-center z-50"
      style="background-color: rgba(0, 0, 0, 0.5);">
      <div class="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button @click.stop="closeForm" class="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
          &times;
        </button>

        <AjoutProduit @close="closeForm" @added="handleProductAdded" />
      </div>
    </div>

    <div v-if="isLoading" class="text-center">Chargement...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <div v-else>
      <div v-for="(group, category) in productsByCategory" :key="category" class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">{{ category }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="product in group" :key="product._id">
            <CardProduct :product="product" @open-info="openProductInfo" />
          </div>
        </div>
      </div>
    </div>

    <InfoProduit v-if="showInfoProduct" :show="showInfoProduct" :product="selectedProduct"
      @close="showInfoProduct = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import AjoutProduit from '@/components/AjoutProduit.vue'
import CardProduct from '@/components/CardProduct.vue'
import InfoProduit from '@/components/InfoProduit.vue'
import { useAuthStore } from '@/store/auth'

const products = ref<Product[]>([])
const isLoading = ref(true)
const error = ref('')
const authStore = useAuthStore()
const showAddForm = ref(false)
const showInfoProduct = ref(false)
const selectedProduct = ref<Product | null>(null)

interface Product {
  _id: string
  name: string
  ref: string
  category: string
  unitPrice: number
  currency: string
  unit: string
  stock: number
}

function openForm() {
  showAddForm.value = true
  showInfoProduct.value = false
}

function closeForm() {
  showAddForm.value = false
}

function handleProductAdded() {
  fetchProducts()
}

function openProductInfo(product: Product) {
  selectedProduct.value = product
  showInfoProduct.value = true
  showAddForm.value = false
}

const fetchProducts = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/products')
    products.value = res.data
  } catch (err) {
    error.value = 'Erreur lors du chargement des produits'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProducts()
  if (authStore.token && !authStore.user) {
    authStore.fetchUserProfile()
  }
})

const productsByCategory = computed(() => {
  const grouped: Record<string, Product[]> = {}
  for (const product of products.value) {
    const cat = product.category || 'Autre'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(product)
  }
  return grouped
})
</script>
