<script setup lang="ts">
// Layout principal avec header, main content et footer
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-gray-800 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Application</h1>
        <nav>
          <ul class="flex space-x-4">
            <li><router-link to="/" class="hover:text-gray-300">Accueil</router-link></li>
            <li><router-link to="/users" class="hover:text-gray-300">Utilisateurs</router-link></li>
            <li><router-link to="/articles" class="hover:text-gray-300">Articles</router-link></li>
            <li><router-link to="/orders" class="hover:text-gray-300">Commandes</router-link></li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main class="flex-grow container mx-auto p-4">
      <router-view />
    </main>
    
    <footer class="bg-gray-800 text-white p-4 mt-auto">
      <div class="container mx-auto text-center">
        <p>&copy; 2024 - Application Vue</p>
      </div>
    </footer>
  </div>
</template> 