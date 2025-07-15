<script setup lang="ts">
</script>

<template>
    <header class="bg-indigo-700 text-white shadow-md sticky top-0 z-50">
        <nav class="container mx-auto flex items-center justify-between py-4 px-6">
            <!-- Logo / Nom de l'appli -->
            <router-link to="/" class="text-3xl font-extrabold tracking-tight hover:text-indigo-300">
                Mon CRM
            </router-link>

            <!-- Liens de navigation -->
            <ul class="flex space-x-10 text-lg font-semibold">
                <li>
                    <router-link to="/" class="hover:text-indigo-300 transition" active-class="underline" exact>
                        Accueil
                    </router-link>
                </li>

                <li>
                    <router-link to="/articles" class="hover:text-indigo-300 transition" active-class="underline">
                        Articles
                    </router-link>
                </li>
                <li>
                    <router-link to="/orders" class="hover:text-indigo-300 transition" active-class="underline">
                        Commandes
                    </router-link>
                </li>
                <li>
                    <router-link to="/users" class="hover:text-indigo-300 transition" active-class="underline">
                        Utilisateurs
                    </router-link>
                </li>
            </ul>
        </nav>
    </header>
</template>
