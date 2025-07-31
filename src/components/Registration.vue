<script setup>
import {ref} from 'vue'
import {registration} from "../api/registration.js";

const form = ref({
  name: '',
  password: '',
})

const showSuccess = ref(false)
const showNameTaken = ref(false)
const showError = ref(false)

async function submitForm() {
  showSuccess.value = false
  showNameTaken.value = false
  showError.value = false

  if (!form.value.name.trim() || !form.value.password.trim()) {
    showError.value = true
    setTimeout(() => (showError.value = false), 3000)
  }

  const response = await registration(form.value.name, form.value.password);

        if (response.success) {
          showSuccess.value = true
          form.value.name = ''
          form.value.password = ''
          setTimeout(() => (showSuccess.value = false), 3000)
        } else if (response.message === "Ошибка валидации") {
          showNameTaken.value = true
          setTimeout(() => (showNameTaken.value = false), 3000)
        } else {
          showError.value = true
          setTimeout(() => (showError.value = false), 3000)
        }
      }

</script>

<template>
  <div class="page-wrapper">
    <div class="form-container registration">
      <form @submit.prevent="submitForm">
        <h2>Регистрация</h2>
        <div class="form-group">
          <label for="username_reg">Имя пользователя:</label>
          <input type="text" id="username_reg" v-model="form.name"/>
        </div>
        <div class="form-group">
          <label for="password_reg">Пароль:</label>
          <input type="password" id="password_reg" v-model="form.password"/>
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>

      <div class="auth-link">
        <router-link to="/login" class="auth-link-style">Авторизация</router-link>
      </div>

      <div
          class="notification"
          v-if="showSuccess"
      >
        Пользователь был успешно зарегистрирован!
      </div>

      <div
          class="notification-taken-name"
          v-if="showNameTaken"
      >
        Данное имя уже занято
      </div>

      <div
          class="notification-wrong"
          v-if="showError"
      >
        Неверное имя пользователя или пароль
      </div>

    </div>
  </div>
  >
</template>

<style scoped>
.page-wrapper {
  font-family: Arial, sans-serif;
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
  margin-top: 290px;
  margin-left: 16px;
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

.notification {
  position: fixed;
  top: 7%;
  left: 89.1%;
  transform: translate(-50%, -50%);
  max-width: 350px;
  width: 90vw;
  padding: 15px;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards, fadeOut 0.3s ease-in 2.7s forwards;
  z-index: 1000;
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
}

.notification-taken-name {
  position: fixed;
  top: 7%;
  left: 93.5%;
  transform: translate(-50%, -50%);
  max-width: 177px;
  width: 90vw;
  padding: 15px;
  background-color: #c50e0e;
  color: white;
  border-radius: 4px;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards,
  fadeOut 0.3s ease-in 2.7s forwards;
  z-index: 1000;
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

.registration {
  background-color: #e0f7fa;
}

.auth-link .auth-link-style {
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
  margin-top: 40px;
  margin-left: 183px;
}

.auth-link .auth-link-style:hover {
  background-color: #f1f8f4;
  color: #444ec1;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

</style>
