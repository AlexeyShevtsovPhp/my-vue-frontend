<script setup>
import {ref} from 'vue'
import {login} from '../api/user.js'

const form = ref({
  name: '',
  password: '',
})

const showError = ref(false)
const errorMessage = ref('')

async function submitForm() {
  if (!form.value.name.trim() || !form.value.password.trim()) {
    showError.value = true;
    setTimeout(() => (showError.value = false), 3000);
    return;
  }
  console.log('Submitting form with', form.value.name, form.value.password);
  const response = await login(form.value.name, form.value.password);
  console.log('Response from login:', response);
  if (response.success) {
    window.location.href = '/categories';
  } else {
    showError.value = true;
    errorMessage.value = 'Неверное имя пользователя или пароль';
    setTimeout(() => (showError.value = false), 3000);
  }
}

</script>

<template>
  <div class="page-wrapper">
    <div class="form-container authorization">
      <h2>Авторизация</h2>
      <form @submit.prevent="submitForm" method="POST" class="authorization">
        <div class="form-group">
          <label for="username_auth">Имя пользователя:</label>
          <input
              v-model="form.name"
              type="text"
              name="name"
              id="username_auth"
          />
        </div>

        <div class="form-group">
          <label for="password_auth">Пароль:</label>
          <input
              v-model="form.password"
              type="password"
              name="password"
              id="password_auth"
          />
        </div>
        <button type="submit">Войти</button>
        <div
            class="notification-wrong"
            v-show="showError"
            style="display: block;"
        >
          {{ errorMessage || 'Неверное имя пользователя или пароль' }}
        </div>
      </form>
      <div class="auth-link-reg">
        <a href="/registration" class="auth-link-style-reg">Регистрация</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  font-family: Arial, sans-serif;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.form-container {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  border-radius: 10px;
  width: 300px;
  margin-top: -15px;
  margin-left: 15px;
}

h2 {
  text-align: center;
  color: #333;
  font-size: 24px;
  margin-bottom: 25px;
}

label {
  font-size: 16px;
  color: #555;
  margin-bottom: 1px;
  display: block;
}

input[type="text"],
input[type="password"] {
  width: 95%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #4d90fe;
  outline: none;
}

button {
  width: 102%;
  padding: 10px;
  background-color: #4d90fe;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.notification-wrong {
  position: fixed;
  top: 7%;
  left: 90.3%;
  transform: translate(-50%, -50%);
  max-width: 305px;
  width: 90vw;
  padding: 15px;
  background-color: #c50e0e;
  color: white;
  border-radius: 4px;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards,
  fadeOut 0.3s ease-in 2.7s forwards;
  z-index: 1000;
  display: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

button:hover {
  background-color: #357ae8;
}

.form-group {
  margin-bottom: 15px;
}

.authorization {
  background-color: #fff9c4;
}

.auth-link-reg .auth-link-style-reg {
  font-size: 18px;
  color: #333;
  text-decoration: none;
  font-weight: normal;
  padding: 12px 20px;
  border-radius: 30px;
  background-color: #eaefec;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: inline-block;
  position: fixed;
  margin-top: 42px;
  margin-left: 185px;
}

.auth-link-reg .auth-link-style-reg:hover {
  background-color: #f1f8f4;
  color: #444ec1;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

</style>
