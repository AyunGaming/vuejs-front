<template>
  <div class="max-w-3xl mx-auto mt-10">
    <h1 class="text-3xl font-bold mb-6 text-center">Historique des commandes</h1>

    <!-- Bouton Créer une commande -->
    <div class="flex justify-end mb-6">
      <button @click="showCreateOrderModal = true"
        class="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800">
        Créer une commande
      </button>
    </div>

    <div v-if="isLoading">Chargement...</div>

    <div v-else-if="error" class="text-red-600 text-center">{{ error }}</div>

    <div v-else>
      <div v-if="orders.length === 0" class="text-gray-500 text-center">Vous n’avez aucune commande.</div>

      <div v-for="order in paginatedOrders" :key="order._id" class="border rounded p-4 mb-6">
        <div class="flex justify-between items-center mb-2">
          <div>
            <p><strong>Commande n°:</strong> {{ order._id }}</p>
            <p><strong>Date:</strong> {{ new Date(order.createdAt).toLocaleString() }}</p>
            <p><strong>Client :</strong> {{ order.user?.firstname || 'Utilisateur inconnu' }} {{ order.user?.lastname ||
              '' }}</p>
          </div>
          <div>
            <span :class="{
              'text-yellow-600': order.status === 'En attente',
              'text-green-600': order.status === 'Payée',
              'text-red-600': order.status === 'Annulée',
              'text-blue-600': order.status === 'Livrée',
              'text-purple-600': order.status === 'En cours',
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

        <div v-if="authStore.isAdmin" class="mt-3 flex flex-col gap-2">
          <button @click="openStatusModal(order)"
            class="self-end px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-40">
            Modifier le statut
          </button>
          <button @click="downloadInvoice(order._id)" class="self-start text-indigo-700 hover:underline font-medium">
            Télécharger la facture
          </button>
        </div>
      </div>
      <div v-if="totalPages > 1" class="flex justify-center mt-6 space-x-2">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
          class="px-3 py-1 border rounded hover:bg-gray-100">
          Précédent
        </button>

        <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="[
          'px-3 py-1 border rounded',
          currentPage === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
        ]">
          {{ page }}
        </button>

        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
          class="px-3 py-1 border rounded hover:bg-gray-100">
          Suivant
        </button>
      </div>
    </div>

    <!-- Modal modification statut -->
    <div v-if="showStatusModal" class="fixed inset-0 flex items-center justify-center z-50"
      style="background-color: rgba(0, 0, 0, 0.5);">
      <form @submit.prevent="updateStatus" class="bg-white rounded p-6 w-96">
        <h3 class="text-xl font-semibold mb-4">Modifier le statut de la commande</h3>

        <select v-model="newStatus" class="w-full p-2 border rounded mb-4" required>
          <option value="En attente">En attente</option>
          <option value="Payée">Payée</option>
          <option value="Annulée">Annulée</option>
          <option value="Livrée">Livrée</option>
          <option value="En cours">En cours</option>
        </select>

        <div class="flex justify-end space-x-4">
          <button type="button" @click="showStatusModal = false" class="px-4 py-2 border rounded">Annuler</button>
          <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Valider</button>
        </div>
      </form>
    </div>

    <!-- Modal création commande -->
    <div v-if="showCreateOrderModal" class="fixed inset-0 flex items-center justify-center z-50"
      style="background-color: rgba(0, 0, 0, 0.5);">
      <PasserCommande :users="users" @close="showCreateOrderModal = false"></PasserCommande>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import PasserCommande from '@/components/PasserCommande.vue'

interface UserInfo {
  _id: string
  firstname: string
  lastname: string
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

interface Article {
  _id: string
  name: string
  unitPrice: number
  stock: number
  unit: string
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
const showStatusModal = ref(false)
const selectedOrder = ref<Order | null>(null)
const newStatus = ref('')

const showCreateOrderModal = ref(false)
const users = ref<UserInfo[]>([])
const articles = ref<Article[]>([])
const quantities = ref<Record<string, number>>({})

const currentPage = ref(1)
const itemsPerPage = 3

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return orders.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(orders.value.length / itemsPerPage)
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}


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

async function fetchUsersAndArticles() {
  try {
    const [resUsers, resArticles] = await Promise.all([
      axios.get('http://localhost:3000/api/users', {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }),
      axios.get('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }),
    ])

    users.value = resUsers.data
    articles.value = resArticles.data

    const initQuantities: Record<string, number> = {}
    articles.value.forEach(a => {
      initQuantities[a._id] = 0
    })
    quantities.value = initQuantities

  } catch (e) {
    console.error('Erreur lors du chargement des utilisateurs ou articles', e)
  }
}

function openStatusModal(order: Order) {
  selectedOrder.value = order
  newStatus.value = order.status
  showStatusModal.value = true
}

async function updateStatus() {
  if (!selectedOrder.value) return

  try {
    const res = await axios.patch(
      `http://localhost:3000/api/orders/${selectedOrder.value._id}/status`,
      { status: newStatus.value },
      {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }
    )

    const idx = orders.value.findIndex(o => o._id === selectedOrder.value?._id)
    if (idx !== -1) {
      orders.value[idx] = res.data.order
    }

    showStatusModal.value = false
  } catch (err) {
    alert('Erreur lors de la mise à jour du statut')
    console.error(err)
  }
}

async function downloadInvoice(orderId: string) {
  try {
    const response = await axios.get(`http://localhost:3000/api/orders/${orderId}/pdf`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `facture-${orderId}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur lors du téléchargement de la facture :', error)
    alert('Erreur lors du téléchargement de la facture.')
  }
}

onMounted(() => {
  fetchOrders()
})

watch(showCreateOrderModal, (visible) => {
  if (visible) {
    fetchUsersAndArticles()
  }
})
</script>
