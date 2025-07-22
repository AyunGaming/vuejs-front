<template>
  <div class="max-w-5xl mx-auto mt-10 px-4">
    <h1 class="text-3xl font-bold mb-12">{{ welcomeMessage }}</h1>

    <section class="mb-12">
      <h2 class="text-xl font-semibold mb-4">
        Chiffre d'affaires de l'entreprise : {{ totalChiffreAffaires.toFixed(2) }} €
      </h2>
    </section>

    <section class="mb-12">
      <h2 class="text-xl font-semibold mb-4">Produits récents</h2>
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
      <h2 class="text-xl font-semibold mb-4">
        Historique des commandes récentes <span class="text-gray-600">(Total de commande : {{ orders.length }})</span>
      </h2>

      <div v-if="!authStore.token" class="text-gray-600 italic">
        Vous devez être connecté pour avoir accès à l’historique de vos commandes.
      </div>

      <div v-else>
        <div v-if="isLoadingOrders" class="text-center">Chargement des commandes...</div>
        <div v-else-if="errorOrders" class="text-red-600">{{ errorOrders }}</div>
        <div v-else>
          <div v-if="orders.length === 0" class="text-gray-500">Aucune commande trouvée.</div>
          <div v-else>
            <ul>
              <li v-for="order in recentSortedOrders" :key="order._id"
                class="grid grid-cols-3 gap-2 items-center border-b py-2 text-sm md:text-base">
                <span class="truncate font-mono">Commande n° {{ order._id }}</span>
                <span :class="{
                  'text-green-600': order.status === 'Payée',
                  'text-blue-600': order.status === 'Livrée',
                  'text-purple-600': order.status === 'En cours',
                  'text-yellow-600': order.status === 'En attente',
                  'text-red-600': order.status === 'Annulée',
                }" class="font-semibold text-center">
                  {{ order.status }}
                </span>
                <span class="text-right font-bold">
                  {{ order.total != null ? order.total.toFixed(2) : 'N/A' }} €
                </span>
              </li>
            </ul>
          </div>
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
  createdAt: string
}

interface OrderSummary {
  _id: string
  status: string
  total: number
  createdAt: string
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

const statusOrder = ['En attente', 'En cours', 'Livrée', 'Payée', 'Annulée']

const totalChiffreAffaires = computed(() => {
  return orders.value.reduce((acc, order) => acc + (order.total ?? 0), 0)
})

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
    const res = await axios.get('http://localhost:3000/api/products')
    products.value = res.data
      .sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
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
    orders.value = res.data.map((o: any) => ({
      _id: o._id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt
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

const recentSortedOrders = computed(() => {
  return orders.value
    .slice()
    .sort((a, b) => {
      const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
      if (statusDiff !== 0) return statusDiff

      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
    .slice(0, 5)
})

</script>
