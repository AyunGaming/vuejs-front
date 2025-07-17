<template>
  <div class="max-w-5xl mx-auto mt-10 px-4">
    <h1 class="text-3xl font-bold mb-12">{{ welcomeMessage }}</h1>

    <section class="mb-12">
      <h2 class="text-xl font-semibold mb-4">Produits</h2>
      <div v-if="isLoadingProducts" class="text-center">Chargement des produits...</div>
      <div v-else-if="errorProducts" class="text-red-600">{{ errorProducts }}</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div v-for="product in products" :key="product._id" class="border rounded p-4 shadow-sm">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold">{{ product.name }}</h3>
            <span class="text-sm text-gray-500">Réf : {{ product.ref }}</span>
          </div>
          <p class="font-bold">
            {{ typeof product.unitPrice === 'number' ? product.unitPrice.toFixed(2) + ' €' : 'Prix indisponible' }}
          </p>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-4">Historique des commandes</h2>

      <div v-if="!authStore.token" class="text-gray-600 italic">
        Vous devez être connecté pour avoir accès à l’historique de vos commandes.
      </div>

      <div v-else>
        <div v-if="isLoadingOrders" class="text-center">Chargement des commandes...</div>
        <div v-else-if="errorOrders" class="text-red-600">{{ errorOrders }}</div>
        <div v-else>
          <div v-if="orders.length === 0" class="text-gray-500">Aucune commande trouvée.</div>
          <ul>
            <li v-for="order in orders" :key="order._id" class="flex justify-between border-b py-2">
              <span>Commande n° {{ order._id }}</span>
              <span :class="{
                'text-green-600': order.status === 'paid',
                'text-yellow-600': order.status === 'pending',
                'text-red-600': order.status === 'cancelled'
              }">
                {{ statusLabel(order.status) }}
              </span>
              <span class="font-bold">
                {{ order.total != null ? order.total.toFixed(2) : 'N/A' }} €
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

interface Product {
  _id: string
  ref: number
  name: string
  unitPrice: number
}

interface OrderSummary {
  _id: string
  status: string
  total: number
}

interface UserInfo {
  firstname: string
  lastname: string
}

const authStore = useAuthStore()

const user = ref<UserInfo | null>(null)
const products = ref<Product[]>([])
const orders = ref<OrderSummary[]>([])

const errorProducts = ref('')
const errorOrders = ref('')
const isLoadingProducts = ref(true)
const isLoadingOrders = ref(true)

async function fetchUserProfile() {
  if (!authStore.token) return
  try {
    const res = await axios.get('http://localhost:3000/api/users/profile', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    user.value = res.data
  } catch (e) {
    console.error('Erreur récupération profil', e)
  }
}

async function fetchProducts() {
  try {
    const res = await axios.get('http://localhost:3000/api/products?limit=3')
    products.value = res.data
  } catch (e) {
    errorProducts.value = 'Erreur lors du chargement des produits.'
    console.error(e)
  } finally {
    isLoadingProducts.value = false
  }
}

async function fetchOrders() {
  if (!authStore.token) {
    isLoadingOrders.value = false
    return
  }
  try {
    const res = await axios.get('http://localhost:3000/api/orders/my-orders', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    // On ne garde que le résumé : id, status, total
    orders.value = res.data.map((o: any) => ({
      _id: o._id,
      status: o.status,
      total: o.total
    }))
  } catch (e) {
    errorOrders.value = 'Erreur lors du chargement des commandes.'
    console.error(e)
  } finally {
    isLoadingOrders.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
  fetchProducts()
  fetchOrders()
})

const welcomeMessage = computed(() => {
  if (user.value) return `Bienvenue ${user.value.firstname} ${user.value.lastname}`
  return 'Bienvenue sur l\'application'
})

const statusLabel = (status: string) => {
  switch (status) {
    case 'paid': return 'Payée'
    case 'pending': return 'En attente'
    case 'cancelled': return 'Annulée'
    default: return status
  }
}
</script>
