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
      <div class="bg-white rounded-lg p-6 max-w-lg w-full overflow-auto max-h-[80vh]">
        <h2 class="text-xl font-bold mb-4">Créer une nouvelle commande</h2>

        <div class="mb-4">
          <label class="block font-medium mb-1">Sélectionner un utilisateur</label>
          <select v-model="selectedUserId" class="w-full border rounded p-2 mb-4" required>
            <option value="" disabled>Choisir un utilisateur</option>
            <option v-for="user in users" :key="user._id" :value="user._id">
              {{ user.firstname }} {{ user.lastname }}
            </option>
          </select>
          <!-- Choix de l’adresse de facturation -->
          <div class="mb-4">
            <label class="block font-medium mb-1">Adresse de facturation</label>
            <select v-model="useExistingBilling" class="w-full border rounded p-2 mb-2">
              <option :value="true">Utiliser l’adresse de l’utilisateur</option>
              <option :value="false">Saisir une nouvelle adresse</option>
            </select>
          </div>

          <!-- Si nouvelle adresse -->
          <div v-if="!useExistingBilling" class="mb-4">
            <p>Veuillez saisir votre nouvelle adresse : </p>
            <input v-model="billingAddress.street" placeholder="N° + Rue" class="w-full border rounded p-2 mb-2" />
            <input v-model="billingAddress.city" placeholder="Ville" class="w-full border rounded p-2 mb-2" />
            <input v-model="billingAddress.postalCode" placeholder="Code postal"
              class="w-full border rounded p-2 mb-2" />
            <input v-model="billingAddress.country" placeholder="Pays" class="w-full border rounded p-2" />
          </div>
        </div>

        <!-- Adresse de livraison -->
        <div class="mb-4">
          <label class="inline-flex items-center space-x-2 mb-2">
            <input type="checkbox" v-model="sameAsBilling" class="accent-indigo-600" />
            <span class="font-medium text-sm">Adresse de livraison identique à la facturation</span>
          </label>
        </div>

        <div v-if="!sameAsBilling" class="mb-4">
          <p class="mb-2 text-sm font-medium text-gray-700">Veuillez saisir votre adresse de livraison :</p>
          <input v-model="shippingAddress.street" placeholder="N° + Rue" class="w-full border rounded p-2 mb-2" />
          <input v-model="shippingAddress.city" placeholder="Ville" class="w-full border rounded p-2 mb-2" />
          <input v-model="shippingAddress.postalCode" placeholder="Code postal"
            class="w-full border rounded p-2 mb-2" />
          <input v-model="shippingAddress.country" placeholder="Pays" class="w-full border rounded p-2" />
        </div>


        <div>
          <h3 class="font-semibold mb-2">Articles disponibles :</h3>
          <div v-for="article in paginatedArticles" :key="article._id" class="flex items-center mb-2 space-x-4">
            <div class="flex-1">
              {{ article.name }} :
              {{ article.unitPrice?.toFixed(2) }} €
              (Stock : {{ article.stock }} {{ article.unit }})
            </div>
            <input type="number" min="0" :max="article.stock" :disabled="article.stock === 0"
              class="w-20 border rounded p-1" v-model.number="quantities[article._id]" />
          </div>
          <div v-if="totalArticlePages > 1" class="flex justify-center mt-4 space-x-2">
            <button @click="goToArticlePage(currentArticlePage - 1)" :disabled="currentArticlePage === 1"
              class="px-3 py-1 border rounded hover:bg-gray-100">
              < </button>

                <button v-for="page in totalArticlePages" :key="page" @click="goToArticlePage(page)" :class="[
                  'px-3 py-1 border rounded',
                  currentArticlePage === page ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'
                ]">
                  {{ page }}
                </button>

                <button @click="goToArticlePage(currentArticlePage + 1)"
                  :disabled="currentArticlePage === totalArticlePages"
                  class="px-3 py-1 border rounded hover:bg-gray-100">
                  >
                </button>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button @click="showCreateOrderModal = false" type="button"
            class="px-4 py-2 border rounded hover:bg-gray-100">Annuler</button>
          <button @click="createOrder" type="button"
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Valider</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

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

// Données commandes existantes
const orders = ref<Order[]>([])
const error = ref('')
const isLoading = ref(true)
const showStatusModal = ref(false)
const selectedOrder = ref<Order | null>(null)
const newStatus = ref('')

// Données modal création commande
const showCreateOrderModal = ref(false)
const users = ref<UserInfo[]>([])
const articles = ref<Article[]>([])
const selectedUserId = ref('')
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

const currentArticlePage = ref(1)
const articlesPerPage = 4

const paginatedArticles = computed(() => {
  const start = (currentArticlePage.value - 1) * articlesPerPage
  const end = start + articlesPerPage
  return articles.value.slice(start, end)
})

const totalArticlePages = computed(() => {
  return Math.ceil(articles.value.length / articlesPerPage)
})

function goToArticlePage(page: number) {
  if (page >= 1 && page <= totalArticlePages.value) {
    currentArticlePage.value = page
  }
}

const useExistingBilling = ref(true)
const billingAddress = ref({
  street: '',
  city: '',
  postalCode: '',
  country: ''
})
const sameAsBilling = ref(true)

const shippingAddress = ref({
  street: '',
  city: '',
  postalCode: '',
  country: ''
})

const selectedUser = computed(() => {
  return users.value.find(u => u._id === selectedUserId.value)
})

// Fetch commandes existantes
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

async function createOrder() {
  if (!selectedUserId.value) {
    alert('Veuillez sélectionner un utilisateur.')
    return
  }

  const items = Object.entries(quantities.value)
    .filter(([_, qty]) => qty > 0)
    .map(([productId, qty]) => ({
      productId,
      stock: qty,
    }))

  if (items.length === 0) {
    alert('Veuillez sélectionner au moins un article avec une quantité supérieure à zéro.')
    return
  }

  // Récupérer l'utilisateur complet (id + billingAddress) - suppose que tu as la liste utilisateurs en cache ou via API
  const selectedUser = users.value.find(u => u._id === selectedUserId.value)
  if (!selectedUser) {
    alert("Utilisateur introuvable.")
    return
  }

  // Adresse de facturation
  const billing = useExistingBilling.value
    ? selectedUser.billingAddress
    : billingAddress.value

  // Adresse de livraison (checkbox sameAsBilling à gérer dans ton composant)
  const shipping = sameAsBilling.value ? billing : shippingAddress.value

  try {
    await axios.post('http://localhost:3000/api/orders/', {
      userId: selectedUserId.value,
      items,
      billingAddress: billing,
      shippingAddress: shipping,
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })

    alert('Commande créée avec succès !')
    showCreateOrderModal.value = false
    fetchOrders()
  } catch (e) {
    console.error('Erreur lors de la création de la commande', e)
    alert('Erreur lors de la création de la commande.')
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
