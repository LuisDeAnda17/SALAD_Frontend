import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiService } from "../services/api";
import type { User } from "../types/api";

export const useAuthStore = defineStore("auth", () => {
    const user = ref<User | null>(null);
    // const isLoading = ref(false);

    const isAuthenticated = computed(() => !!user.value);
    const userId = computed(() => user.value?._id || null);

    async function login(username: string, password: string) {
        try {
        const response = await apiService.login({ username, password });
        user.value = { _id: response.data.user, username };
        //Eventually add session handling here
        return response;
        } catch (error) {
        console.error("Login failed:", error);
        return false;
        }
    }

    async function register(username: string, password: string) {
        try {
        const response = await apiService.register({ username, password });
        return response;
        } catch (error) {
        console.error("Registration failed:", error);
        return false;
        }
    }

    return {
    //State
        user, 
        isAuthenticated, 
    //Actions
        login,
        register
    };
});