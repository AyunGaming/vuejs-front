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
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
</script>
