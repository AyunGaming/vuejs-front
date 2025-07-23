<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Liste des produits</h1>

      <button v-if="authStore.isAdmin" @click="openForm"
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        Ajouter un produit
      </button>
    </div>

    <div v-if="showAddForm || showEditForm" class="fixed inset-0 flex items-center justify-center z-50"
      style="background-color: rgba(0, 0, 0, 0.5);">
      <div class="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button @click.stop="closeForm" class="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
          &times;
        </button>

        <AjoutProduit 
          v-if="showAddForm" 
          @close="closeForm" 
          @added="handleProductAdded" 
        />
        <AjoutProduit 
          v-if="showEditForm" 
          :edit-mode="true" 
          :product-to-edit="productToEdit" 
          @close="closeForm" 
          @added="handleProductAdded" 
        />
      </div>
    </div>

    <div v-if="isLoading" class="text-center">Chargement...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <div v-else>
      <div v-for="(group, category) in productsByCategory" :key="category" class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">{{ category }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="product in group" :key="product._id">
            <CardProduct 
              :product="product" 
              @open-info="openProductInfo"
              @edit="editProduct"
              @delete="confirmDeleteProduct"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 flex items-center justify-center z-50"
      style="background-color: rgba(0, 0, 0, 0.5);">
      <div class="bg-white rounded-lg p-6 max-w-md relative">
        <h3 class="text-xl font-bold mb-4">Confirmer la suppression</h3>
        <p>Êtes-vous sûr de vouloir supprimer le produit "{{ productToDelete?.name }}" ?</p>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button @click="showDeleteConfirm = false" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Annuler
          </button>
          <button @click="deleteProduct" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Supprimer
          </button>
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
const showEditForm = ref(false)
const showInfoProduct = ref(false)
const selectedProduct = ref<Product | null>(null)
const productToEdit = ref<Product | null>(null)
const showDeleteConfirm = ref(false)
const productToDelete = ref<Product | null>(null)

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

function openForm() {
  showAddForm.value = true
  showEditForm.value = false
  showInfoProduct.value = false
  showDeleteConfirm.value = false
}

function closeForm() {
  showAddForm.value = false
  showEditForm.value = false
  productToEdit.value = null
}

function handleProductAdded() {
  fetchProducts()
  closeForm()
}

function openProductInfo(product: Product) {
  selectedProduct.value = product
  showInfoProduct.value = true
  showAddForm.value = false
  showEditForm.value = false
  showDeleteConfirm.value = false
}

function editProduct(product: Product) {
  if (!authStore.isAdmin) {
    alert("Seuls les administrateurs peuvent modifier un produit")
    return
  }
  
  productToEdit.value = product
  showEditForm.value = true
  showAddForm.value = false
  showInfoProduct.value = false
  showDeleteConfirm.value = false
}

function confirmDeleteProduct(product: Product) {
  if (!authStore.isAdmin) {
    alert("Seuls les administrateurs peuvent supprimer un produit")
    return
  }
  
  productToDelete.value = product
  showDeleteConfirm.value = true
  showAddForm.value = false
  showEditForm.value = false
  showInfoProduct.value = false
}

async function deleteProduct() {
  if (!productToDelete.value) return
  
  try {
    isLoading.value = true
    const token = localStorage.getItem('token')
    
    await axios.delete(`http://localhost:3000/api/products/${productToDelete.value._id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    // Rafraîchir la liste des produits
    await fetchProducts()
    showDeleteConfirm.value = false
    productToDelete.value = null
    
  } catch (err) {
    console.error('Erreur lors de la suppression du produit:', err)
    error.value = 'Erreur lors de la suppression du produit'
  } finally {
    isLoading.value = false
  }
}

const fetchProducts = async () => {
  try {
    isLoading.value = true
    const res = await axios.get('http://localhost:3000/api/products')
    products.value = res.data
    error.value = ''
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
    const catName =
      typeof product.category === 'object' && product.category !== null
        ? product.category
        : product.category || 'Autre'

    if (!grouped[catName]) grouped[catName] = []
    grouped[catName].push(product)
  }

  return grouped
})
</script>
