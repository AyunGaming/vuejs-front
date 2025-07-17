<template>
    <div class="max-w-2xl mx-auto mt-10">
        <h1 class="text-2xl font-bold mb-6 text-center">Mon panier</h1>

        <div v-if="!authStore.isLoggedIn" class="text-red-600 text-center">
            Pour accéder au panier, merci de vous connecter.
        </div>

        <div v-else>
            <div v-if="cartStore.items.length === 0" class="text-gray-500">
                Votre panier est vide.
            </div>

            <div v-else>
                <div v-for="item in cartStore.items" :key="item.id"
                    class="flex justify-between items-center mb-4 p-4 border rounded">
                    <div>
                        <h2 class="font-semibold">{{ item.name }}</h2>
                        <p class="text-sm text-gray-500">Quantité : {{ item.quantity }}</p>
                    </div>
                    <div class="text-right">
                        <p>{{ item.price }} €</p>
                        <button @click="remove(item.id)" class="text-red-600 text-sm mt-1 hover:underline">
                            Supprimer
                        </button>
                    </div>
                </div>

                <div class="text-right font-bold mt-4">
                    Total : {{ totalPrice }} €
                </div>

                <div class="text-right mt-6">
                    <button @click="passerCommande"
                        class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        :disabled="cartStore.items.length === 0">
                        Passer commande
                    </button>
                    <p v-if="successMessage" class="text-green-600 mt-2">{{ successMessage }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { computed, ref } from 'vue'
import axios from 'axios'

const cartStore = useCartStore()
const authStore = useAuthStore()

const totalPrice = computed(() => cartStore.totalPrice)
const successMessage = ref('')

function remove(id: string) {
    cartStore.removeFromCart(id)
}

async function passerCommande() {
    if (!authStore.token) {
        alert('Vous devez être connecté pour passer commande.')
        return
    }

    try {
        const response = await axios.post(
            'http://localhost:3000/api/orders',
            {
                items: cartStore.items,
                total: cartStore.totalPrice,
            },
            {
                headers: {
                    Authorization: `Bearer ${authStore.token}`,
                },
            }
        )
        successMessage.value = 'Commande passée avec succès !'
        cartStore.clearCart()
        setTimeout(() => {
            successMessage.value = ''
        }, 1500)
    } catch (error) {
        alert('Erreur lors de la commande.')
        console.error(error)
    }
}

</script>
