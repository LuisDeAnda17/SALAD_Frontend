<template>
    <div class="login-container">

        <div v-if="useLogin">
            <h1>Login</h1>
            <form @submit.prevent="handleLogin" >
            <div class="form-group">
                <label for="username">Username:</label>
                <input id="username" 
                       v-model="loginForm.username" 
                       type="text"
                       required /> 
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input id="password"
                       v-model="loginForm.password" 
                       type="text" 
                       required />
            </div>
            <button type="submit">Login</button>
            </form>
        </div>

        <div v-else>
            <h1>Register</h1>
            <form @submit.prevent="handleRegister">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text"
                       id="username"
                       v-model="registerForm.username" 
                       required /> 
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="text"
                       id="password" 
                       v-model="registerForm.password" 
                       required />
            </div>
            <button type="submit">Register</button>
            </form>
        </div>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>

    <button @click="toggleForm" class="btn btn-link">
        {{
            useLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"
        }}
    </button>
</template>

<script setup>
import { ref } from "vue";
import { apiService } from "../services/api";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const errorMessage = ref("");
const router = useRouter();
const useLogin = ref(true);
const loginForm = ref({
  username: "",
  password: "",
});
const registerForm = ref({
  username: "",
  password: "",
});

const authStore = useAuthStore();

const toggleForm = () => {
  useLogin.value = !useLogin.value;
};

const handleLogin = async () => {
  try {
    await authStore.login({
        username: loginForm.value.username,
        password: loginForm.value.password,
    });
    router.push("/");
  } catch (error) {
    errorMessage.value = "Login failed. Please check your credentials.";
  }
};

const handleRegister = async () => {
  try {
    await authStore.register(
        registerForm.value.username,
        registerForm.value.password,
    );

    // 2. Automatically log in
    await authStore.login({
      username: registerForm.value.username,
      password: registerForm.value.password,
    });

     // 3. Navigate to home
    router.push("/");

  } catch (error) {
    errorMessage.value = "Registration failed. Please try again.";
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>