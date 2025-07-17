<template>
  <div class="max-w-3xl mx-auto mt-10">
    <h1 class="text-2xl font-bold mb-6 text-center">Historique des commandes</h1>

    <div v-if="isLoading">Chargement...</div>

    <div v-else-if="error" class="text-red-600 text-center">{{ error }}</div>

    <div v-else>
      <div v-if="orders.length === 0" class="text-gray-500">Vous n’avez aucune commande.</div>

      <div v-for="order in orders" :key="order._id" class="border rounded p-4 mb-6">
        <div class="flex justify-between items-center mb-2">
          <div>
            <p><strong>Commande n°:</strong> {{ order._id }}</p>
            <p><strong>Date:</strong> {{ new Date(order.createdAt).toLocaleString() }}</p>
            <p><strong>Client :</strong> {{ order.user.firstname }} {{ order.user.lastname }}</p>
          </div>
          <div>
            <span :class="{
              'text-green-600': order.status === 'Payée',
              'text-yellow-600': order.status === 'En attente',
              'text-red-600': order.status === 'Annulée',
            }" class="font-semibold">
              {{ order.status }}
            </span>
          </div>
        </div>

        <div>
          <h3 class="font-semibold mt-4">Détails :</h3>
          <ul>
            <li v-for="item in order.items" :key="item.id" class="flex justify-between">
              <span>{{ item.name }} x {{ item.quantity }}</span>
              <span>{{ (item.price * item.quantity).toFixed(2) }} €</span>
            </li>
          </ul>
          <div class="text-right font-bold mt-2">
            Total : {{ order.total.toFixed(2) }} €
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

interface UserInfo {
  firstname: string
  lastname: string
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  user: UserInfo

}

const authStore = useAuthStore()
const orders = ref<Order[]>([])
const error = ref('')
const isLoading = ref(true)

async function fetchOrders() {
  if (!authStore.token) {
    error.value = 'Veuillez vous connecter pour accéder à l’historique de vos commandes.'
    isLoading.value = false
    return
  }

  try {
    const response = await axios.get('http://localhost:3000/api/orders/my-orders', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      }
    })
    orders.value = response.data
  } catch (e) {
    error.value = 'Erreur lors du chargement des commandes.'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})
</script>
