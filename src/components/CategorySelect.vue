<template>
  <div class="relative">
    <input 
      type="text" 
      v-model="searchQuery"
      :placeholder="placeholder"
      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      @focus="showDropdown = true"
      @blur="handleBlur"
      :disabled="disabled"
    />
    
    <div v-if="showDropdown && !disabled" class="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-60 overflow-y-auto">
      <!-- Résultats filtrés -->
      <div v-if="filteredCategories.length > 0">
        <div 
          v-for="cat in filteredCategories" 
          :key="cat.id"
          class="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
          @mousedown.prevent="selectCategory(cat)"
        >
          {{ cat.name }}
        </div>
      </div>
      
      <!-- Option pour créer une nouvelle catégorie -->
      <div v-if="searchQuery && !exactMatch" 
          class="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer border-t border-gray-200"
          @mousedown.prevent="createCategory">
        Créer "{{ searchQuery }}"
      </div>
      
      <!-- Message si pas de résultats -->
      <div v-if="filteredCategories.length === 0 && !searchQuery" class="px-3 py-2 text-gray-500 italic">
        Commencez à taper pour rechercher ou créer une catégorie
      </div>
    </div>
    
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';

interface Category {
  id: string | number;
  name: string;
  [key: string]: any; // Pour les autres propriétés éventuelles
}

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Rechercher ou créer une catégorie'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'created']);

const searchQuery = ref(props.modelValue);
const showDropdown = ref(false);
const categories = ref<Category[]>([]);
const error = ref('');
const loading = ref(false);
const selectedCategoryName = ref('');

// Suivre les modifications de la valeur externe
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue;
});

// Émettre les changements (uniquement le nom de la catégorie)
watch(selectedCategoryName, (newValue) => {
  emit('update:modelValue', newValue);
});

// Filtrer les catégories en fonction de la recherche
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  
  const query = searchQuery.value.toLowerCase();
  return categories.value.filter(cat => 
    cat.name.toLowerCase().includes(query)
  );
});

// Vérifier si la recherche correspond exactement à une catégorie existante
const exactMatch = computed(() => {
  if (!searchQuery.value) return false;
  return categories.value.some(cat => 
    cat.name.toLowerCase() === searchQuery.value.toLowerCase()
  );
});

// Fonction pour récupérer les catégories depuis l'API
async function fetchCategories() {
  loading.value = true;
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.get('http://localhost:3000/api/categories', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    categories.value = response.data;
    loading.value = false;
  } catch (err) {
    console.error('Erreur lors du chargement des catégories', err);
    error.value = 'Impossible de charger les catégories';
    loading.value = false;
  }
}

// Sélectionner une catégorie existante
function selectCategory(category: Category) {
  searchQuery.value = category.name;
  selectedCategoryName.value = category.name;
  showDropdown.value = false;
}

// Créer une nouvelle catégorie
async function createCategory() {
  if (!searchQuery.value.trim()) return;
  
  const token = localStorage.getItem('token');
  const newCategoryName = searchQuery.value.trim();
  
  try {
    const response = await axios.post('http://localhost:3000/api/categories', 
      { name: newCategoryName },
      { 
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    
    // Ajouter la nouvelle catégorie à la liste
    const newCategory = response.data;
    categories.value.push(newCategory);
    selectedCategoryName.value = newCategoryName;
    showDropdown.value = false;
    emit('created', newCategory);
    error.value = '';
  } catch (err) {
    console.error('Erreur lors de la création de la catégorie', err);
    error.value = 'Impossible de créer la catégorie';
  }
}

function handleBlur() {
  // Petit délai pour permettre le clic sur les options
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
}

// Mettre à jour la recherche quand l'utilisateur tape
watch(searchQuery, (newValue) => {
  // Si la recherche est vide, effacer la sélection
  if (!newValue) {
    selectedCategoryName.value = '';
  }
});

// Charger les catégories au montage du composant
onMounted(() => {
  fetchCategories();
  
  // Si une valeur est déjà définie, l'utiliser comme recherche
  if (props.modelValue) {
    searchQuery.value = props.modelValue;
    selectedCategoryName.value = props.modelValue;
  }
});
</script> 