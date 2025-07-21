<template>
  <header class="bg-indigo-700 text-white shadow-md sticky top-0 z-50">
    <nav class="container mx-auto flex items-center justify-between py-4 px-6">
      <router-link to="/" class="text-3xl font-extrabold tracking-tight hover:text-indigo-300">
        Mon CRM
      </router-link>

      <ul class="flex space-x-10 text-lg font-semibold">
        <li>
          <router-link to="/" class="hover:text-indigo-300 transition" active-class="underline" exact>
            Accueil
          </router-link>
        </li>

        <li>
          <router-link to="/produits" class="hover:text-indigo-300 transition" active-class="underline">
            Produits
          </router-link>
        </li>

        <li>
          <router-link to="/orders" class="hover:text-indigo-300 transition" active-class="underline">
            Commandes
          </router-link>
        </li>
        <li v-if="auth.isAdmin">
          <router-link to="/users" class="hover:text-indigo-300 transition" active-class="underline">
            Utilisateurs
          </router-link>
        </li>
        <li>
          <router-link v-if="!auth.isLoggedIn" to="/connexion" class="hover:text-indigo-300 transition"
            active-class="underline">
            Connexion
          </router-link>

          <router-link v-else to="/profil" class="hover:text-indigo-300 transition" active-class="underline">
            Profil
          </router-link>
        </li>
        <li>
          <router-link to="/panier" class="relative">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span v-if="itemCount"
              class="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {{ itemCount }}
            </span>
          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { computed } from 'vue'

const cartStore = useCartStore()
const itemCount = computed(() => cartStore.itemCount)
const auth = useAuthStore()
</script>
