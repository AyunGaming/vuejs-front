<template>
    <div class="max-w-5xl mx-auto mt-10 px-4">
        <h1 class="text-3xl font-bold mb-6 text-center">Gestion des utilisateurs</h1>
        <div class="flex justify-end mb-4">
            <button v-if="authStore.user?.role === 'admin'" @click="openCreateModal"
                class="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800">
                Ajouter un utilisateur
            </button>
        </div>

        <div v-if="showCreateModal" class="fixed inset-0 flex items-center justify-center z-50"
            style="background-color: rgba(0, 0, 0, 0.5);">
            <div class="bg-white rounded-lg p-6 w-full max-w-md relative">
                <button @click.stop="showCreateModal = false"
                    class="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
                    &times;
                </button>

                <UserCreateForm @close="showCreateModal = false" @added="fetchUsers" />
            </div>
        </div>

        <div v-if="isLoading" class="text-center">Chargement...</div>
        <div v-else-if="error" class="text-red-600 text-center">{{ error }}</div>

        <table v-else class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead class="bg-indigo-700 text-white">
                <tr>
                    <th class="py-3 px-4 text-left">Nom</th>
                    <th class="py-3 px-4 text-left">Email</th>
                    <th class="py-3 px-4 text-left">Rôle</th>
                    <th class="py-3 px-4 text-left">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user._id" class="border-t hover:bg-gray-50">
                    <td class="py-2 px-4">{{ user.firstname }} {{ user.lastname }}</td>
                    <td class="py-2 px-4">{{ user.email }}</td>
                    <td class="py-2 px-4">{{ user.role }}</td>
                    <td class="py-2 px-4 space-x-4">
                        <button @click="openEditModal(user)"
                            class="text-indigo-600 hover:underline font-medium">Modifier</button>
                        <button @click="confirmDeleteUser(user._id)"
                            class="text-red-600 hover:underline font-medium">Supprimer</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50"
            style="background-color: rgba(0, 0, 0, 0.5);">
            <div class="bg-white p-6 rounded shadow w-full max-w-md relative">
                <h2 class="text-xl font-bold mb-4">Modifier l'utilisateur</h2>

                <form @submit.prevent="updateUser">
                    <div class="mb-3">
                        <label class="block text-sm font-medium">Prénom</label>
                        <input v-model="editUser!.firstname" class="w-full border rounded p-2 bg-gray-200" readonly />
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium">Nom</label>
                        <input v-model="editUser!.lastname" class="w-full border rounded p-2 bg-gray-200" readonly />
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium">Email</label>
                        <input v-model="editUser!.email" class="w-full border rounded p-2 bg-gray-200" readonly
                            type="email" />
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium">Rôle</label>
                        <select v-model="editUser!.role" class="w-full border rounded p-2">
                            <option value="user">Utilisateur</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div class="flex justify-end space-x-2">
                        <button type="button" @click="closeModal" class="border px-4 py-2 rounded">
                            Annuler
                        </button>
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                            Sauvegarder
                        </button>
                    </div>
                </form>

            </div>
        </div>

        <!-- Modal confirmation suppression -->
        <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center z-50"
            style="background-color: rgba(0, 0, 0, 0.5);">
            <div class=" bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
                <p class="mb-4 text-gray-800">Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
                <div class="flex justify-end space-x-4">
                    <button @click="cancelDelete" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                        Annuler
                    </button>
                    <button @click="deleteUserConfirmed"
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Supprimer
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import UserCreateForm from '@/components/AjoutUser.vue'

interface User {
    _id: string
    firstname: string
    lastname: string
    email: string
    role: string
}

const users = ref<User[]>([])
const error = ref('')
const isLoading = ref(true)
const showModal = ref(false)
const editUser = ref<User | null>(null)

const showDeleteModal = ref(false)
const userToDelete = ref<string | null>(null)

const authStore = useAuthStore()

const showCreateModal = ref(false)

async function fetchUsers() {
    try {
        const res = await axios.get('http://localhost:3000/api/users', {
            headers: {
                Authorization: `Bearer ${authStore.token}`
            }
        })
        users.value = res.data
    } catch (err) {
        error.value = 'Erreur lors du chargement des utilisateurs.'
        console.error(err)
    } finally {
        isLoading.value = false
    }
}

function openEditModal(user: User) {
    editUser.value = { ...user }
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    editUser.value = null
}

async function updateUser() {
    if (!editUser.value) return
    try {
        const res = await axios.put(`http://localhost:3000/api/users/${editUser.value._id}`, editUser.value, {
            headers: {
                Authorization: `Bearer ${authStore.token}`
            }
        })
        const index = users.value.findIndex(u => u._id === editUser.value?._id)
        if (index !== -1) users.value[index] = res.data
        closeModal()
    } catch (err) {
        alert('Erreur lors de la mise à jour')
        console.error(err)
    }
}

function confirmDeleteUser(id: string) {
    userToDelete.value = id
    showDeleteModal.value = true
}

function cancelDelete() {
    showDeleteModal.value = false
    userToDelete.value = null
}

async function deleteUserConfirmed() {
    if (!userToDelete.value) return
    try {
        await axios.delete(`http://localhost:3000/api/users/${userToDelete.value}`, {
            headers: {
                Authorization: `Bearer ${authStore.token}`
            }
        })
        users.value = users.value.filter(u => u._id !== userToDelete.value)
    } catch (err) {
        alert('Erreur lors de la suppression')
        console.error(err)
    } finally {
        showDeleteModal.value = false
        userToDelete.value = null
    }
}

function openCreateModal() {
    showCreateModal.value = true
}

onMounted(() => {
    fetchUsers()
})
</script>
