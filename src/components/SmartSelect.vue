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
      <div v-if="filteredItems.length > 0">
        <div 
          v-for="item in filteredItems" 
          :key="item._id"
          class="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
          @mousedown.prevent="selectItem(item)"
        >
          {{ item.name }}
        </div>
      </div>
      
      <!-- Option pour créer un nouvel élément -->
      <div v-if="searchQuery && !exactMatch && allowCreate" 
          class="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer border-t border-gray-200"
          @mousedown.prevent="createItem">
        Créer "{{ searchQuery }}"
      </div>
      
      <!-- Message si pas de résultats -->
      <div v-if="filteredItems.length === 0 && !searchQuery" class="px-3 py-2 text-gray-500 italic">
        {{ emptyMessage }}
      </div>
    </div>
    
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';

interface Item {
  id: string | number;
  name: string;
  [key: string]: any;
}

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Rechercher...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  apiEndpoint: {
    type: String,
    required: true
  },
  allowCreate: {
    type: Boolean,
    default: true
  },
  emptyMessage: {
    type: String,
    default: 'Commencez à taper pour rechercher ou créer'
  },
  preloadedItems: {
    type: Array as () => Item[],
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'created']);

const searchQuery = ref(props.modelValue);
const showDropdown = ref(false);
const items = ref<Item[]>(props.preloadedItems);
const error = ref('');
const loading = ref(false);
const selectedItemName = ref('');

// Suivre les modifications de la valeur externe
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue;
});

// Émettre les changements
watch(selectedItemName, (newValue) => {
  emit('update:modelValue', newValue);
});

// Filtrer les éléments en fonction de la recherche
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  
  const query = searchQuery.value.toLowerCase();
  return items.value.filter(item => 
    item.name.toLowerCase().includes(query)
  );
});

// Vérifier si la recherche correspond exactement à un élément existant
const exactMatch = computed(() => {
  if (!searchQuery.value) return false;
  return items.value.some(item => 
    item.name.toLowerCase() === searchQuery.value.toLowerCase()
  );
});

// Fonction pour récupérer les éléments depuis l'API
async function fetchItems() {
  if (!props.apiEndpoint) return;
  
  loading.value = true;
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.get(`http://localhost:3000/api/${props.apiEndpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    items.value = response.data;
    loading.value = false;
  } catch (err) {
    console.error(`Erreur lors du chargement des ${props.apiEndpoint}`, err);
    error.value = `Impossible de charger les données`;
    loading.value = false;
  }
}

// Sélectionner un élément existant
function selectItem(item: Item) {
  searchQuery.value = item.name;
  selectedItemName.value = item.name;
  showDropdown.value = false;
}

// Créer un nouvel élément
async function createItem() {
  if (!searchQuery.value.trim() || !props.allowCreate) return;
  
  const token = localStorage.getItem('token');
  const newItemName = searchQuery.value.trim();
  
  try {
    const response = await axios.post(`http://localhost:3000/api/${props.apiEndpoint}`, 
      { name: newItemName },
      { 
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    
    // Ajouter le nouvel élément à la liste
    const newItem = response.data;
    items.value.push(newItem);
    selectedItemName.value = newItemName;
    showDropdown.value = false;
    emit('created', newItem);
    error.value = '';
  } catch (err) {
    console.error(`Erreur lors de la création`, err);
    error.value = `Impossible de créer "${newItemName}"`;
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
    selectedItemName.value = '';
  }
});

// Charger les éléments au montage du composant
onMounted(() => {
  if (props.preloadedItems.length === 0) {
    fetchItems();
  }
  
  // Si une valeur est déjà définie, l'utiliser comme recherche
  if (props.modelValue) {
    searchQuery.value = props.modelValue;
    selectedItemName.value = props.modelValue;
  }
});
</script> 