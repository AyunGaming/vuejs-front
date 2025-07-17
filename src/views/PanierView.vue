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
                        <button @click="remove(item.id)"
                            class="text-red-600 text-sm mt-1 hover:underline">Supprimer</button>
                    </div>
                </div>

                <div class="text-right font-bold mt-4">Total : {{ totalPrice.toFixed(2) }} €</div>

                <!-- Adresse Livraison -->
                <div class="mt-6">
                    <label for="shippingAddress" class="block font-medium mb-1">Adresse de livraison :</label>
                    <select id="shippingAddress" v-model="selectedShippingKey" class="border p-2 rounded w-full mb-4"
                        required>
                        <option disabled value="">-- Choisissez une adresse --</option>
                        <option v-for="(address, key) in shippingAddresses" :key="key" :value="key">
                            {{ formatAddress(address) }}
                        </option>
                        <option value="new">Ajouter une nouvelle adresse</option>
                    </select>

                    <div v-if="selectedShippingKey === 'new'" class="space-y-2 mb-4">
                        <template v-for="field in fields" :key="field">
                            <input v-model="newShippingAddress[field]" :placeholder="getPlaceholder(field)"
                                class="border p-2 rounded w-full" />
                        </template>
                    </div>
                </div>

                <!-- Adresse Facturation -->
                <div class="mt-6">
                    <label class="inline-flex items-center mb-2">
                        <input type="checkbox" v-model="billingSameAsShipping" class="mr-2" />
                        Adresse de facturation identique à l’adresse de livraison
                    </label>

                    <div v-if="!billingSameAsShipping">
                        <label for="billingAddress" class="block font-medium mb-1">Adresse de facturation :</label>
                        <select id="billingAddress" v-model="selectedBillingKey" class="border p-2 rounded w-full mb-4"
                            required>
                            <option disabled value="">-- Choisissez une adresse --</option>
                            <option v-for="(addr, key) in billingAddresses" :key="key" :value="key">
                                {{ formatAddress(addr) }}
                            </option>
                            <option value="new">Ajouter une nouvelle adresse</option>
                        </select>

                        <div v-if="selectedBillingKey === 'new'" class="space-y-2 mb-4">
                            <template v-for="field in fields" :key="field">
                                <input v-model="newBillingAddress[field]" :placeholder="getPlaceholder(field)"
                                    class="border p-2 rounded w-full" />
                            </template>
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

const fields: (keyof Address)[] = ["street", "city", "postalCode", "country"]
const placeholders: Record<keyof Address, string> = {
    street: "Rue",
    city: "Ville",
    postalCode: "Code postal",
    country: "Pays",
}
function getPlaceholder(field: keyof Address): string {
    return placeholders[field]
}

const cartStore = useCartStore()
const authStore = useAuthStore()

const shippingAddresses = ref<Record<string, Address>>({})
const billingAddresses = ref<Record<string, Address>>({})
const selectedShippingKey = ref("")
const selectedBillingKey = ref("")
const billingSameAsShipping = ref(true)

const newShippingAddress = ref<Address>({ street: "", city: "", postalCode: "", country: "" })
const newBillingAddress = ref<Address>({ street: "", city: "", postalCode: "", country: "" })

const successMessage = ref("")
const errorMessage = ref("")

const totalPrice = computed(() => cartStore.totalPrice)

function isAddressComplete(addr: Address) {
    return fields.every(field => addr[field].trim() !== "")
}

function getSelectedAddress(
    selectedKey: string,
    newAddr: Address,
    saved: Record<string, Address>
): Address | undefined {
    if (selectedKey === "new") {
        return isAddressComplete(newAddr) ? { ...newAddr } : undefined
    } else {
        return saved[selectedKey]
    }
}

const isFormValid = computed(() => {
    const shippingValid =
        selectedShippingKey.value === "new"
            ? isAddressComplete(newShippingAddress.value)
            : selectedShippingKey.value !== ""

    const billingValid = billingSameAsShipping.value
        ? shippingValid
        : selectedBillingKey.value === "new"
            ? isAddressComplete(newBillingAddress.value)
            : selectedBillingKey.value !== ""

    return shippingValid && billingValid
})

function resetForm() {
    selectedShippingKey.value = ""
    selectedBillingKey.value = ""
    billingSameAsShipping.value = true
    newShippingAddress.value = { street: "", city: "", postalCode: "", country: "" }
    newBillingAddress.value = { street: "", city: "", postalCode: "", country: "" }
}

function formatAddress(addr: Address) {
    return `${addr.street}, ${addr.postalCode} ${addr.city}, ${addr.country}`
}

function remove(id: string) {
    cartStore.removeFromCart(id)
}

onMounted(async () => {
    if (!authStore.token) return
    try {
        const res = await axios.get("http://localhost:3000/api/users/profile", {
            headers: { Authorization: `Bearer ${authStore.token}` },
        })

        const userAddress = res.data.address || res.data.shippingAddress
        if (userAddress) {
            shippingAddresses.value.default = userAddress
            selectedShippingKey.value = "default"
        }

        if (res.data.billingAddress) {
            billingAddresses.value.default = res.data.billingAddress
            shippingAddresses.value.facturation = res.data.billingAddress
            selectedBillingKey.value = "default"
        }
    } catch (e) {
        console.error("Erreur récupération profil", e)
    }
})

async function passerCommande() {
    if (!authStore.token) {
        alert("Vous devez être connecté pour passer commande.")
        return
    }

    const shippingAddressToSend = getSelectedAddress(
        selectedShippingKey.value,
        newShippingAddress.value,
        shippingAddresses.value
    )

    if (!shippingAddressToSend) {
        alert("Veuillez sélectionner une adresse de livraison complète.")
        return
    }

    const billingAddressToSend = billingSameAsShipping.value
        ? shippingAddressToSend
        : getSelectedAddress(selectedBillingKey.value, newBillingAddress.value, billingAddresses.value)

    if (!billingAddressToSend) {
        alert("Veuillez sélectionner une adresse de facturation complète.")
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
        resetForm()
        setTimeout(() => {
            successMessage.value = ""
        }, 3000)
    } catch (error) {
        errorMessage.value = "Erreur lors de la commande."
        console.error(error)
    }
}
</script>
