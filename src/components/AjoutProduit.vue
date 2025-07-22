<template>
    <div class="max-w-md mx-auto p-4 bg-white rounded shadow">
        <!-- Indicateur d'étapes -->
        <StepIndicator
            :steps="steps"
            v-model:currentStep="currentStep"
            :validateBeforeChange="true"
            activeColor="indigo"
            completedColor="green"
        />

        <!-- Titre de l'étape -->
        <h2 class="text-xl font-bold mb-4 text-center text-indigo-800">{{ steps[currentStep].name }}</h2>

        <!-- Formulaire -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Étape 1: Informations de base -->
            <div v-if="currentStep === 0" class="space-y-6">
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
                    <SmartSelect 
                        v-model="category"
                        placeholder="Rechercher ou créer une catégorie"
                        apiEndpoint="categories"
                        emptyMessage="Commencez à taper pour rechercher ou créer une catégorie"
                    />
                </div>
            </div>

            <!-- Étape 2: Informations commerciales -->
            <div v-if="currentStep === 1" class="space-y-6">
                <div>
                    <label class="block mb-1 font-semibold" for="unit">Unité</label>
                    <SmartSelect 
                        v-model="unit"
                        placeholder="Rechercher ou créer une unité"
                        apiEndpoint="units"
                        emptyMessage="Commencez à taper pour rechercher ou créer une unité"
                    />
                </div>

                <div>
                    <label class="block mb-1 font-semibold" for="billingFrequency">Fréquence de facturation</label>
                    <SmartSelect 
                        v-model="billingFrequency"
                        placeholder="Rechercher ou créer une fréquence de facturation"
                        apiEndpoint="billing-frequencies"
                        emptyMessage="Commencez à taper pour rechercher ou créer une fréquence"
                    />
                </div>

                <div>
                    <label class="block mb-1 font-semibold" for="unitPrice">Prix unitaire</label>
                    <input id="unitPrice" type="number" v-model.number="unitPrice" placeholder="Prix unitaire"
                        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                    <label class="block mb-1 font-semibold" for="currency">Devise</label>
                    <SmartSelect 
                        v-model="currency"
                        placeholder="Sélectionnez une devise"
                        apiEndpoint="currencies"
                        :allowCreate="true"
                        emptyMessage="Sélectionnez une devise dans la liste"
                    />
                </div>
            </div>

            <!-- Étape 3: Informations de stock -->
            <div v-if="currentStep === 2" class="space-y-6">
                <div>
                    <label class="block mb-1 font-semibold" for="stock">Stock</label>
                    <input id="stock" type="number" v-model.number="stock" placeholder="Stock"
                        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div class="py-4">
                    <h3 class="font-semibold mb-2">Récapitulatif</h3>
                    <div class="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
                        <p><span class="font-medium">Référence:</span> {{ refProduct || '(Non renseigné)' }}</p>
                        <p><span class="font-medium">Nom:</span> {{ name || '(Non renseigné)' }}</p>
                        <p><span class="font-medium">Catégorie:</span> {{ category || '(Non renseigné)' }}</p>
                        <p><span class="font-medium">Unité:</span> {{ unit || '(Non renseigné)' }}</p>
                        <p><span class="font-medium">Fréquence:</span> {{ billingFrequency || '(Non renseigné)' }}</p>
                        <p><span class="font-medium">Prix:</span> {{ unitPrice || '0' }} {{ currency || '' }}</p>
                        <p><span class="font-medium">Stock:</span> {{ stock || '0' }}</p>
                    </div>
                </div>
            </div>

            <div v-if="error" class="text-red-600 font-semibold">{{ error }}</div>

            <div class="flex justify-between">
                <button 
                    v-if="currentStep > 0" 
                    type="button" 
                    @click="prevStep"
                    class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                    Précédent
                </button>
                <div v-else></div>

                <button 
                    v-if="currentStep < steps.length - 1" 
                    type="button" 
                    @click="nextStep"
                    class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Suivant
                </button>
                <button 
                    v-else 
                    type="submit" 
                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Finaliser
                </button>
            </div>
        </form>
    </div>
</template>


<script setup lang="ts">
import { ref, reactive } from 'vue'
import axios from 'axios'
import SmartSelect from './SmartSelect.vue'
import StepIndicator from './StepIndicator.vue'

const emit = defineEmits(['close', 'added'])
const token = localStorage.getItem('token');

// Données du formulaire
const refProduct = ref('')
const name = ref('')
const category = ref('')
const unit = ref('')
const billingFrequency = ref('')
const unitPrice = ref<number | null>(null)
const currency = ref('')
const stock = ref<number | null>(null)
const error = ref('')

// Navigation par étapes
const currentStep = ref(0)
const steps = reactive([
    { 
        name: "Identification", 
        isValid: () => !!refProduct.value && !!name.value && !!category.value
    },
    { 
        name: "Tarification",
        isValid: () => !!unit.value && !!billingFrequency.value && unitPrice.value !== null && unitPrice.value > 0 && !!currency.value
    },
    { 
        name: "Stock",
        isValid: () => stock.value !== null && stock.value >= 0
    }
])

// Navigation
function nextStep() {
    if (currentStep.value < steps.length - 1) {
        if (!steps[currentStep.value].isValid()) {
            error.value = `Veuillez remplir tous les champs obligatoires de l'étape ${steps[currentStep.value].name}`
            return
        }
        
        error.value = ''
        currentStep.value++
    }
}

function prevStep() {
    if (currentStep.value > 0) {
        error.value = ''
        currentStep.value--
    }
}

async function handleSubmit() {
    // Vérification finale avant soumission
    for (let i = 0; i < steps.length; i++) {
        if (!steps[i].isValid()) {
            error.value = `Veuillez compléter l'étape ${steps[i].name} avant de finaliser`
            currentStep.value = i
            return
        }
    }

    try {
        await axios.post('http://localhost:3000/api/products', {
            ref: refProduct.value,
            name: name.value,
            category: category.value,
            unit: unit.value,
            billingFrequency: billingFrequency.value,
            unitPrice: unitPrice.value,
            currency: currency.value,
            stock: stock.value
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
