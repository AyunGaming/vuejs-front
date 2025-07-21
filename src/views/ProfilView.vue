<template>
    <div class="max-w-md mx-auto p-6 bg-white rounded shadow">
        <h2 class="text-2xl font-bold mb-4 text-center">Mon profil</h2>
        <form @submit.prevent="updateProfile" class="space-y-4">
            <div>
                <label for="firstname" class="block mb-1 font-medium">Prénom</label>
                <input id="firstname" v-model="firstname" type="text" required class="border p-2 w-full rounded" />
            </div>
            <div>
                <label for="lastname" class="block mb-1 font-medium">Nom</label>
                <input id="lastname" v-model="lastname" type="text" required class="border p-2 w-full rounded" />
            </div>
            <div>
                <label for="email" class="block mb-1 font-medium">Email</label>
                <input id="email" v-model="email" type="email" required class="border p-2 w-full rounded" />
            </div>

            <fieldset class="border p-4 rounded space-y-3">
                <legend class="font-semibold mb-2">Adresse de facturation</legend>
                <div>
                    <label for="billingStreet" class="block mb-1">N° + Rue</label>
                    <input id="billingStreet" v-model="billingAddress.street" type="text" required
                        class="border p-2 w-full rounded" />
                </div>
                <div>
                    <label for="billingCity" class="block mb-1">Ville</label>
                    <input id="billingCity" v-model="billingAddress.city" type="text" required
                        class="border p-2 w-full rounded" />
                </div>
                <div>
                    <label for="billingPostalCode" class="block mb-1">Code postal</label>
                    <input id="billingPostalCode" v-model="billingAddress.postalCode" type="text" required
                        class="border p-2 w-full rounded" />
                </div>
                <div>
                    <label for="billingCountry" class="block mb-1">Pays</label>
                    <input id="billingCountry" v-model="billingAddress.country" type="text" required
                        class="border p-2 w-full rounded" />
                </div>
            </fieldset>

            <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                Enregistrer les modifications
            </button>

            <button @click="handleLogout" class="w-full bg-red-600 text-white px-4 py-2 rounded mt-4 hover:bg-red-700">
                Déconnexion
            </button>

            <p v-if="success" class="text-green-600 mt-2">{{ success }}</p>
            <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const error = ref('')
const success = ref('')

const billingAddress = reactive({
    street: '',
    city: '',
    postalCode: '',
    country: ''
})

const token = localStorage.getItem('token')
const router = useRouter()
const auth = useAuthStore()

async function fetchProfile() {
    error.value = ''
    try {
        const response = await axios.get('http://localhost:3000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
        firstname.value = response.data.firstname
        lastname.value = response.data.lastname
        email.value = response.data.email

        if (response.data.billingAddress) {
            Object.assign(billingAddress, response.data.billingAddress)
        }
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Erreur lors du chargement du profil'
    }
}

async function updateProfile() {
    error.value = ''
    success.value = ''
    try {
        await axios.put('http://localhost:3000/api/users/profile', {
            firstname: firstname.value,
            lastname: lastname.value,
            email: email.value,
            billingAddress: { ...billingAddress }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        success.value = 'Profil mis à jour avec succès !'
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Erreur lors de la mise à jour'
    }
}

function handleLogout() {
    auth.logout()
    router.push('/connexion')
}

onMounted(() => {
    fetchProfile()
})

</script>
