import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "../types/api";
import { authApi } from "@/services/api/authApi";

export const useAuthStore = defineStore("auth", () => {
    const user = ref<User | null>(null);
    const sessionId = ref<string | null>(null);
    // const isLoading = ref(false);
    // Clear user from localStorage
    const clearStorage = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('sessionId')
    }

    const isAuthenticated = computed(() => !!user.value);
    const userId = computed(() => user.value?._id || null);

        // Logout user
    async function logout() {
        try {
            await authApi.logout({session: sessionId?.value || ''}); 
        } catch (error) {
            console.error("Logout failed:", error);
        }
        user.value = null
        sessionId.value = null
        clearStorage()
    }

    async function login(username: string, password: string) {
        try {
        const response = await authApi.login({ username, password });
        user.value = { _id: response.data.user, username };
        sessionId.value = response.data.session;
        //Eventually add session handling here
        return response;
        } catch (error) {
        console.error("Login failed:", error);
        return false;
        }
    }

    async function register(username: string, password: string) {
        try {
        const response = await authApi.register({ username, password });
        return response;
        } catch (error) {
        console.error("Registration failed:", error);
        return false;
        }
    }


    return {
    //State
        user, 
    //Getters
        isAuthenticated, 
        userId,
        sessionId,
    //Actions
        login,
        register,
        logout
    };
});