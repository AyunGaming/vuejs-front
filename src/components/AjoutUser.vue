<template>
  <div class="max-w-md mx-auto p-4 bg-white rounded shadow">
    <StepIndicator
      :steps="steps"
      v-model:currentStep="currentStep"
      :validateBeforeChange="true"
      activeColor="indigo"
      completedColor="green"
    />

    <h2 class="text-xl font-bold mb-4 text-center text-indigo-800">
      {{ steps[currentStep].name }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Étape 1 : Identité -->
      <div v-if="currentStep === 0" class="space-y-4">
        <input v-model="user.firstname" placeholder="Prénom" class="form-input" />
        <input v-model="user.lastname" placeholder="Nom" class="form-input" />
        <input v-model="user.email" type="email" placeholder="Email" class="form-input" />
      </div>

      <!-- Étape 2 : Sécurité -->
      <div v-if="currentStep === 1" class="space-y-4">
        <input v-model="user.password" type="password" placeholder="Mot de passe" class="form-input" />
        <select v-model="user.role" class="form-input">
          <option value="user">Utilisateur</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <!-- Étape 3 : Adresse -->
      <div v-if="currentStep === 2" class="space-y-4">
        <input v-model="user.billingAddress.street" placeholder="Rue" class="form-input" />
        <input v-model="user.billingAddress.city" placeholder="Ville" class="form-input" />
        <input v-model="user.billingAddress.postalCode" placeholder="Code postal" class="form-input" />
        <input v-model="user.billingAddress.country" placeholder="Pays" class="form-input" />
      </div>

      <!-- Étape 4 : Résumé -->
      <div v-if="currentStep === 3" class="space-y-2 bg-gray-50 p-4 rounded">
        <p><strong>Prénom :</strong> {{ user.firstname }}</p>
        <p><strong>Nom :</strong> {{ user.lastname }}</p>
        <p><strong>Email :</strong> {{ user.email }}</p>
        <p><strong>Rôle :</strong> {{ user.role }}</p>
        <p><strong>Adresse :</strong> {{ user.billingAddress.street }}, {{ user.billingAddress.city }}, {{ user.billingAddress.postalCode }}, {{ user.billingAddress.country }}</p>
      </div>

      <div v-if="error" class="text-red-600 font-semibold">{{ error }}</div>

      <!-- Navigation -->
      <div class="flex justify-between">
        <button v-if="currentStep > 0" type="button" @click="prevStep" class="btn-secondary">Précédent</button>
        <div v-else></div>
        <button
          v-if="currentStep < steps.length - 1"
          type="button"
          @click="nextStep"
          class="btn-primary"
        >
          Suivant
        </button>
        <button v-else type="submit" class="btn-success">Créer</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import axios from 'axios'
import StepIndicator from './StepIndicator.vue'

const emit = defineEmits(['close', 'added'])
const token = localStorage.getItem('token')

const currentStep = ref(0)
const error = ref('')

const user = reactive({
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  role: 'user',
  billingAddress: {
    street: '',
    city: '',
    postalCode: '',
    country: ''
  }
})

const steps = [
  { name: 'Identité', isValid: () => !!user.firstname && !!user.lastname && !!user.email },
  { name: 'Sécurité', isValid: () => !!user.password && !!user.role },
  { name: 'Adresse', isValid: () => !!user.billingAddress.street && !!user.billingAddress.city },
  { name: 'Récapitulatif', isValid: () => true }
]

function nextStep() {
  if (!steps[currentStep.value].isValid()) {
    error.value = `Complétez l'étape "${steps[currentStep.value].name}" avant de continuer.`
    return
  }
  error.value = ''
  currentStep.value++
}

function prevStep() {
  error.value = ''
  if (currentStep.value > 0) currentStep.value--
}

async function handleSubmit() {
  try {
    await axios.post('http://localhost:3000/api/users/new', user, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    emit('added')
    emit('close')
  } catch (err) {
    error.value = "Erreur lors de la création de l'utilisateur"
    console.error(err)
  }
}
</script>

<style scoped>
.form-input {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
}
.btn-primary {
  background-color: #6366f1;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}
.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}
.btn-success {
  background-color: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}
</style>
