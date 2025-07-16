<template>
  <form @submit.prevent="handleLogin" class="space-y-4">
    <div>
      <label for="email" class="block mb-1 font-medium">Email</label>
      <input id="email" v-model="email" type="email" required class="border p-2 w-full rounded" />
    </div>
    <div>
      <label for="password" class="block mb-1 font-medium">Mot de passe</label>
      <input id="password" v-model="password" type="password" required class="border p-2 w-full rounded" />
    </div>
    <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Se connecter</button>
    <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>
    <p class="mt-4 text-sm">
      Pas de compte ?
      <a href="#" @click.prevent="$emit('switch')" class="text-indigo-600 hover:underline">Inscrivez-vous</a>
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const auth = useAuthStore()

async function handleLogin() {
  error.value = ''
  try {
    const response = await axios.post('http://localhost:3000/api/users/login', {
      email: email.value,
      password: password.value
    })

    const token = response.data.token
    auth.login(token)
    router.push('/') 

  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la connexion'
  }
}
</script>
