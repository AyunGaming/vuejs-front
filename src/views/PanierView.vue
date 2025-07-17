<template>
    <div class="max-w-2xl mx-auto mt-10">
        <h1 class="text-2xl font-bold mb-6 text-center">Mon panier</h1>

        <div v-if="!authStore.isLoggedIn" class="text-red-600 text-center">
            Pour accéder au panier, merci de vous connecter.
        </div>

        <div v-else>
            <div v-if="cartStore.items.length === 0" class="text-gray-500 text-center">
                Votre panier est vide 😩.
            </div>

            <div v-else>
                <div v-for="item in cartStore.items" :key="item.id"
                    class="flex justify-between items-center mb-4 p-4 border rounded">
                    <div>
                        <h2 class="font-semibold">{{ item.name }}</h2>
                        <p class="text-sm text-gray-500">Quantité : {{ item.quantity }}</p>
                    </div>
                    <div class="text-right">
                        <p>{{ (item.price * item.quantity).toFixed(2) }} €</p>
                        <button @click="remove(item.id)" class="text-red-600 text-sm mt-1 hover:underline">
                            Supprimer
                        </button>
                    </div>
                </div>

                <div class="text-right font-bold mt-4">Total : {{ totalPrice.toFixed(2) }} €</div>

                <!-- Adresse Livraison -->
                <div class="mt-6">
                    <label for="shippingAddress" class="block font-medium mb-1">
                        Adresse de livraison :
                    </label>

                    <select id="shippingAddress" v-model="selectedShippingKey" class="border p-2 rounded w-full mb-4"
                        required>
                        <option disabled value="">-- Choisissez une adresse --</option>
                        <option v-for="(address, key) in shippingAddresses" :key="key" :value="key">
                            {{ key === 'facturation' ? formatAddress(address) :
                            formatAddress(address) }}
                        </option>
                        <option value="new">Ajouter une nouvelle adresse</option>
                    </select>

                    <div v-if="selectedShippingKey === 'new'" class="space-y-2 mb-4">
                        <input v-model="newShippingAddress.street" type="text" placeholder="Rue"
                            class="border p-2 rounded w-full" required />
                        <input v-model="newShippingAddress.city" type="text" placeholder="Ville"
                            class="border p-2 rounded w-full" required />
                        <input v-model="newShippingAddress.postalCode" type="text" placeholder="Code postal"
                            class="border p-2 rounded w-full" required />
                        <input v-model="newShippingAddress.country" type="text" placeholder="Pays"
                            class="border p-2 rounded w-full" required />
                    </div>
                </div>

                <!-- Adresse Facturation -->
                <div class="mt-6">
                    <label class="inline-flex items-center mb-2">
                        <input type="checkbox" v-model="billingSameAsShipping" class="mr-2" />
                        Adresse de facturation identique à l’adresse de livraison
                    </label>

                    <div v-if="!billingSameAsShipping">
                        <label for="billingAddress" class="block font-medium mb-1">
                            Adresse de facturation :
                        </label>

                        <select id="billingAddress" v-model="selectedBillingKey" class="border p-2 rounded w-full mb-4"
                            required>
                            <option disabled value="">-- Choisissez une adresse --</option>
                            <option v-for="(addr, key) in billingAddresses" :key="key" :value="key">
                                {{ formatAddress(addr) }}
                            </option>
                            <option value="new">Ajouter une nouvelle adresse</option>
                        </select>

                        <div v-if="selectedBillingKey === 'new'" class="space-y-2 mb-4">
                            <input v-model="newBillingAddress.street" type="text" placeholder="Rue"
                                class="border p-2 rounded w-full" required />
                            <input v-model="newBillingAddress.city" type="text" placeholder="Ville"
                                class="border p-2 rounded w-full" required />
                            <input v-model="newBillingAddress.postalCode" type="text" placeholder="Code postal"
                                class="border p-2 rounded w-full" required />
                            <input v-model="newBillingAddress.country" type="text" placeholder="Pays"
                                class="border p-2 rounded w-full" required />
                        </div>
                    </div>
                </div>

                <button @click="passerCommande"
                    class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mt-6"
                    :disabled="cartStore.items.length === 0 || !isFormValid">
                    Passer commande
                </button>

                <p v-if="successMessage" class="text-green-600 mt-2">{{ successMessage }}</p>
                <p v-if="errorMessage" class="text-red-600 mt-2">{{ errorMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import axios from "axios"
import { useCartStore } from "@/store/cart"
import { useAuthStore } from "@/store/auth"

interface Address {
    street: string
    city: string
    postalCode: string
    country: string
}

const cartStore = useCartStore()
const authStore = useAuthStore()

const shippingAddresses = ref<Record<string, Address>>({})
const billingAddresses = ref<Record<string, Address>>({})
const selectedShippingKey = ref("")
const selectedBillingKey = ref("")
const billingSameAsShipping = ref(true)

const newShippingAddress = ref<Address>({
    street: "",
    city: "",
    postalCode: "",
    country: "",
})

const newBillingAddress = ref<Address>({
    street: "",
    city: "",
    postalCode: "",
    country: "",
})

const successMessage = ref("")
const errorMessage = ref("")

const totalPrice = computed(() => cartStore.totalPrice)

// Validation simple des adresses
function isAddressComplete(addr: Address) {
    return (
        addr.street.trim() !== "" &&
        addr.city.trim() !== "" &&
        addr.postalCode.trim() !== "" &&
        addr.country.trim() !== ""
    )
}

const isFormValid = computed(() => {
    // Livraison
    let shippingValid = false
    if (selectedShippingKey.value === "new") {
        shippingValid = isAddressComplete(newShippingAddress.value)
    } else {
        shippingValid = selectedShippingKey.value !== ""
    }

    // Facturation
    let billingValid = false
    if (billingSameAsShipping.value) {
        billingValid = shippingValid
    } else {
        if (selectedBillingKey.value === "new") {
            billingValid = isAddressComplete(newBillingAddress.value)
        } else {
            billingValid = selectedBillingKey.value !== ""
        }
    }

    return shippingValid && billingValid
})

onMounted(async () => {
    if (!authStore.token) return

    try {
        const res = await axios.get("http://localhost:3000/api/users/profile", {
            headers: { Authorization: `Bearer ${authStore.token}` },
        })

        const userAddress = res.data.address || res.data.shippingAddress

        if (userAddress) {
            shippingAddresses.value = { default: userAddress }

            selectedShippingKey.value = "default"
        }

        if (res.data.billingAddress) {
            billingAddresses.value = { default: res.data.billingAddress }
            shippingAddresses.value['facturation'] = res.data.billingAddress
            selectedBillingKey.value = "default"
        } else {
            billingSameAsShipping.value = true
        }
    } catch (e) {
        console.error("Erreur récupération profil", e)
    }
})


function formatAddress(addr: Address) {
    return `${addr.street}, ${addr.postalCode} ${addr.city}, ${addr.country}`
}

function remove(id: string) {
    cartStore.removeFromCart(id)
}

async function passerCommande() {
    if (!authStore.token) {
        alert("Vous devez être connecté pour passer commande.")
        return
    }

    // Prépare adresse livraison
    let shippingAddressToSend: Address | undefined = undefined
    if (selectedShippingKey.value === "new") {
        if (!isAddressComplete(newShippingAddress.value)) {
            alert("Merci de remplir tous les champs de la nouvelle adresse de livraison.")
            return
        }
        shippingAddressToSend = { ...newShippingAddress.value }
    } else {
        shippingAddressToSend = shippingAddresses.value[selectedShippingKey.value]
    }

    if (!shippingAddressToSend) {
        alert("Veuillez sélectionner une adresse de livraison.")
        return
    }

    // Prépare adresse facturation
    let billingAddressToSend: Address | undefined = undefined
    if (billingSameAsShipping.value) {
        billingAddressToSend = shippingAddressToSend
    } else {
        if (selectedBillingKey.value === "new") {
            if (!isAddressComplete(newBillingAddress.value)) {
                alert("Merci de remplir tous les champs de la nouvelle adresse de facturation.")
                return
            }
            billingAddressToSend = { ...newBillingAddress.value }
        } else {
            billingAddressToSend = billingAddresses.value[selectedBillingKey.value]
        }
    }

    if (!billingAddressToSend) {
        alert("Veuillez sélectionner une adresse de facturation.")
        return
    }

    try {
        await axios.post(
            "http://localhost:3000/api/orders",
            {
                items: cartStore.items,
                total: cartStore.totalPrice,
                shippingAddress: shippingAddressToSend,
                billingAddress: billingAddressToSend,
            },
            {
                headers: {
                    Authorization: `Bearer ${authStore.token}`,
                },
            }
        )
        successMessage.value = "Commande passée avec succès !"
        cartStore.clearCart()
        selectedShippingKey.value = ""
        selectedBillingKey.value = ""
        billingSameAsShipping.value = true
        newShippingAddress.value = {
            street: "",
            city: "",
            postalCode: "",
            country: "",
        }
        newBillingAddress.value = {
            street: "",
            city: "",
            postalCode: "",
            country: "",
        }
        setTimeout(() => {
            successMessage.value = ""
        }, 3000)
    } catch (error) {
        errorMessage.value = "Erreur lors de la commande."
        console.error(error)
    }
}
</script>
