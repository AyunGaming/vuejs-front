<!-- PasserCommande.vue -->
<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center" style="background-color: rgba(0, 0, 0, 0.5);">
        <div class="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
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
                    <input v-model="billingAddress.street" placeholder="N° + Rue"
                        class="w-full border rounded p-2 mb-2" />
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
                <button @click="$emit('close')" class="px-4 py-2 border rounded hover:bg-gray-100">Annuler</button>
                <button @click="createOrder"
                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Valider</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'

interface UserInfo {
    _id: string
    firstname: string
    lastname: string
    billingAddress: {
        street: string
        city: string
        postalCode: string
        country: string
    }
}

interface Article {
    _id: string
    name: string
    unitPrice: number
    stock: number
    unit: string
}

const authStore = useAuthStore()

const showModal = ref(false)
const users = ref<UserInfo[]>([])
const articles = ref<Article[]>([])
const selectedUserId = ref('')
const useExistingBilling = ref(true)
const sameAsBilling = ref(true)
const emit = defineEmits(['close'])

const billingAddress = ref({
    street: '',
    city: '',
    postalCode: '',
    country: ''
})

const shippingAddress = ref({
    street: '',
    city: '',
    postalCode: '',
    country: ''
})

const quantities = ref<Record<string, number>>({})
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

async function createOrder() {
    const selectedUser = users.value.find(u => u._id === selectedUserId.value)
    if (!selectedUser) return alert("Utilisateur introuvable.")

    const items = Object.entries(quantities.value)
        .filter(([_, qty]) => qty > 0)
        .map(([productId, qty]) => ({
            productId,
            stock: qty,
        }))

    if (items.length === 0) {
        alert("Aucun article sélectionné")
        return
    }

    const billing = useExistingBilling.value
        ? selectedUser.billingAddress
        : billingAddress.value

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

        alert('Commande créée avec succès')
        showModal.value = false
        emit('close')
    } catch (e) {
        console.error(e)
        alert('Erreur lors de la création de la commande')
    }
}

onMounted(() => {
    fetchUsersAndArticles()
})
</script>
