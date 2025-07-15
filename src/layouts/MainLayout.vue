<script setup lang="ts">
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Header />
    <main class="flex-grow container mx-auto px-6 py-8">
      <router-view />
    </main>
    <Footer />
  </div>
</template>
