import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null as null | {
      _id: string
      firstname: string
      lastname: string
      email: string
      role: 'admin' | 'user'
    }
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    login(token: string) {
      this.token = token
      localStorage.setItem('token', token)
      this.fetchUserProfile() // Appelle immédiat
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },

    async fetchUserProfile() {
      if (!this.token) return

      try {
        const res = await axios.get('http://localhost:3000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        this.user = res.data
      } catch (error) {
        console.error('Erreur lors de la récupération du profil utilisateur :', error)
        this.user = null
      }
    }
  }
})
