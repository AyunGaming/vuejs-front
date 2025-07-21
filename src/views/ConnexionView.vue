<template>
  <div class="max-w-md mx-auto p-4 border rounded shadow mt-10">
    <component :is="showLogin ? LoginForm : RegisterForm" @switch="toggleForm" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '../components/Login.vue'
import RegisterForm from '../components/Register.vue'

const showLogin = ref(true)

function toggleForm() {
  showLogin.value = !showLogin.value
}
</script>
