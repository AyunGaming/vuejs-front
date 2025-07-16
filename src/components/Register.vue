<template>
  <form @submit.prevent="handleRegister" class="space-y-4">
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
    <div>
      <label for="password" class="block mb-1 font-medium">Mot de passe</label>
      <input id="password" v-model="password" type="password" required minlength="6" class="border p-2 w-full rounded" />
    </div>
    <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">S'inscrire</button>
    <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>
    <p class="mt-4 text-sm">
      Déjà un compte ?
      <a href="#" @click.prevent="$emit('switch')" class="text-indigo-600 hover:underline">Connectez-vous</a>
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

async function handleRegister() {
  error.value = ''
  try {
    await axios.post('http://localhost:3000/api/users/register', {
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      password: password.value,
    })
    alert("Inscription réussie, vous pouvez maintenant vous connecter !")
    router.push('/login')  
  } catch (err: any) {
    error.value = err.response?.data?.message || "Erreur lors de l'inscription"
  }
}
</script>
