<template>
    <form @submit.prevent="handleSubmit" class="space-y-6 max-w-md mx-auto p-4 bg-white rounded shadow">
        <div>
            <label class="block mb-1 font-semibold" for="ref">Référence</label>
            <input id="ref" v-model="refProduct" placeholder="Référence"
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
            <label class="block mb-1 font-semibold" for="name">Nom</label>
            <input id="name" v-model="name" placeholder="Nom"
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
            <label class="block mb-1 font-semibold" for="category">Catégorie</label>
            <input id="category" v-model="category" placeholder="Catégorie"
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
            <label class="block mb-1 font-semibold" for="unit">Unité</label>
            <input id="unit" v-model="unit" placeholder="Unité"
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
            <label class="block mb-1 font-semibold" for="billingFrequency">Fréquence de facturation</label>
            <input id="billingFrequency" v-model="billingFrequency" placeholder="Fréquence de facturation"
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
            <label class="block mb-1 font-semibold" for="unitPrice">Prix unitaire</label>
            <input id="unitPrice" type="number" v-model.number="unitPrice" placeholder="Prix unitaire"
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
            <label class="block mb-1 font-semibold" for="currency">Devise</label>
            <input id="currency" v-model="currency" placeholder="Devise"
                class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div v-if="error" class="text-red-600 font-semibold">{{ error }}</div>

        <div class="flex justify-end">
            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Ajouter
            </button>
        </div>
    </form>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['close', 'added'])
const token = localStorage.getItem('token');

const refProduct = ref('')
const name = ref('')
const category = ref('')
const unit = ref('')
const billingFrequency = ref('')
const unitPrice = ref<number | null>(null)
const currency = ref('EUR')
const error = ref('')

async function handleSubmit() {
    if (!refProduct.value || !category.value || !name.value || !unit.value || !billingFrequency.value || unitPrice.value === null || unitPrice.value <= 0) {
        error.value = 'Merci de remplir tous les champs correctement.'
        return
    }

    try {
        await axios.post('http://localhost:3000/api/products', {
            ref: refProduct.value,
            name: name.value,
            category: category.value,
            unit: unit.value,
            billingFrequency: billingFrequency.value,
            unitPrice: unitPrice.value,
            currency: currency.value
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        
        emit('added')
        emit('close')
    } catch (err) {
        error.value = 'Erreur lors de l\'ajout du produit.'
        console.error(err)
    }
}
</script>
