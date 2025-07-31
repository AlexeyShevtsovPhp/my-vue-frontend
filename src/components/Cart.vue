<script>
import {fetchCart, fetchAllCart, removeFromCart, clearAll} from '../api/goods.js';
import {buy} from "../api/purchase.js";

export default {
  data() {
    return {
      cartItems: [],
      totalPrice: 0,

      currentPage: 1,
      totalPages: 1,

      username: localStorage.getItem('username') || 'Гость',
      role: localStorage.getItem('role') || null,
      email: localStorage.getItem('email'),

      isLoading: false,
      message: '',

      showNotification: false,
      showError: false,
      notificationText: '',
      errorMessage: '',
    };
  },
  methods: {
    async loadCart(page = this.currentPage) {
      const data = await fetchCart(page);

      this.cartItems = data.items;
      this.totalPrice = data.totalSum;
      this.totalPages = data.lastPage || 1;

      if (this.cartItems.length === 0 && this.currentPage > 1) {
        this.currentPage--;
        await this.loadCart();
      }
    },

    profile() {
      this.$router.push('/profile');
    },

    deleteItem(productId) {
      removeFromCart(productId).then(() => {
        this.cartItems = this.cartItems.filter(item => item.id !== productId);
        this.loadCart(this.currentPage);
      });
    },

    async pay() {
      this.isLoading = true;

      if (this.cartItems.length === 0) {
        this.errorMessage = 'Ваша корзина пустая, купите что-нибудь';
        this.showError = true;
        this.isLoading = false;

        setTimeout(() => {
          this.showError = false;
        }, 3000);
        return;
      }

      try {
        await buy();
        await clearAll();
        await this.loadCart();

        this.notificationText = 'Благодарим вас за вашу покупку!';
        this.isLoading = false;
        this.showNotification = true;
        this.message = '';

        setTimeout(() => {
          this.showNotification = false;
        }, 3000);
      } catch (error) {
        this.errorMessage = error.response.data.error;
        this.showError = true;
        this.isLoading = false;

        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    },

    goToPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.loadCart();
    },

    categories() {
      this.$router.push('/categories');
    },
  },

  mounted() {
    this.loadCart();
  },

  computed: {
    avatarSrc() {
      return this.role === 'guest'
          ? '/images/userIcon/guest.png'
          : '/images/userIcon/admin.png';
    },
    hasMorePages() {
      return this.currentPage < this.totalPages;
    },
  },
};
</script>

<template>
  <div class="logout">
    <a href="/logout" class="logout-style" @click.prevent="categories">
      <img src="/images/interface/back.png" alt="Выйти из аккаунта" class="logout-icon"/>
    </a>
  </div>

  <div class="greetings">
    <a href="/profile" class="logout-style" @click.prevent="profile">
      <img :src="avatarSrc" class="avatar" style="transform: scaleX(-1);" alt="none"/>
      <span1 class="user-name">{{ username }}</span1>
    </a>
  </div>

  <div v-if="showNotification" class="notification">
    {{ notificationText }}
  </div>
  <div v-if="showError" class="notification-wrong">
    {{ errorMessage }}
  </div>

  <div class="page-wrapper">
    <span id="cart-sign">Корзина</span>
    <table id="cart">
      <thead>
      <tr>
        <th>Название</th>
        <th>Цена</th>
        <th>Количество</th>
        <th style="width: 25px"></th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="cartItems.length === 0">
        <td colspan="4" style="text-align: center; font-style: italic; color: #888;">Пусто</td>
      </tr>
      <tr v-for="item in cartItems" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.price }}₽</td>
        <td>{{ item.quantity }}</td>
        <td>
          <button class="small-button" @click="deleteItem(item.id)">-</button>
        </td>
      </tr>
      </tbody>
    </table>
    <label>Итог: {{ totalPrice }}₽</label>

    <div class="button-container">
      <button
          :class="{ disabled: currentPage === 1 }"
          class="previous-page"
          @click="goToPage(currentPage - 1)"
      >
        <img src="/images/interface/back.png" alt="Назад" class="left-arrow"/>
      </button>

      <button
          :class="{ disabled: !hasMorePages }"
          class="next-page"
          @click="goToPage(currentPage + 1)"
      >
        <img
            src="/images/interface/back.png"
            alt="Вперёд"
            class="right-arrow"
            style="transform: scaleX(-1)"
        />
      </button>
    </div>

    <button v-if="isLoading" class="disabled-submit" disabled>
      Оплата...
    </button>
    <button v-else class="purchase" @click.prevent="pay">
      Оплатить
    </button>
  </div>
</template>

<style scoped>
.page-wrapper {
  font-family: Arial, sans-serif;
}

.button-container {
  display: flex;
  justify-content: center;
  max-width: 20px;
  margin-left: 1284px;
  margin-top: 14px;
  gap: 20px;
}

button {
  font-family: 'Roboto', sans-serif;
  padding: 12px 30px;
  font-size: 1.2em;
  font-weight: 500;
  cursor: pointer;
  background-color: #ffffff;
  color: #454242;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  height: 45px;
  display: inline-block;
}

button:hover {
  transform: scale(1.05);
  background-color: #d1f6d7;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.purchase {
  margin-left: 1250px;
  margin-top: 40px;
}

.notification {
  position: fixed;
  top: 12%;
  left: 91.3%;
  transform: translate(-50%, -50%);
  max-width: 275px;
  width: 90vw;
  padding: 15px;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards,
  fadeOut 0.3s ease-in 2.7s forwards;
  z-index: 1000;
}

.notification-wrong {
  position: fixed;
  top: 12%;
  left: 90.4%;
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

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
  }
}

.left-arrow {
  width: 35px;
  margin-left: -5px;
  margin-top: -9px;
  height: 35px;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.right-arrow {
  width: 35px;
  margin-left: -2px;
  margin-top: -8px;
  height: 35px;
  transition: transform 0.3s ease, filter 0.3s ease;
}

table {
  margin-top: 290px;
  margin-left: 470px;
  width: 50%;
  border-collapse: collapse;
  font-family: 'Arial', sans-serif;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

th {
  background-color: #f7f7f7;
  color: #333;
  padding: 14px;
  font-size: 1.1em;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

span {
  position: absolute;
  font-size: 2em;
  color: #34495e;
  margin-left: 470px;
  margin-top: -55px;
  line-height: 1.6;
  font-family: 'Arial', sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1),
  0 0 6px rgba(108, 198, 192, 0.3);
  font-weight: 600;
}

td {
  padding: 12px;
  font-size: 1em;
  color: #555;
  vertical-align: middle;
}

button.small-button {
  font-size: 19px;
  padding: 2px 8px;
  height: 25px;
  border-radius: 3px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.5s;
}

button.small-button:hover {
  transform: scale(1.05);
  background-color: #d8eef3;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

label {
  margin-top: 8px;
  margin-left: 471px;
  position: absolute;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  width: fit-content;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

a {
  border-width: 1px;
  border-color: black;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  text-decoration-color: #0a0a0a;
  outline: none;
  color: black;
}

.disabled {
  background-color: #898e8d;
  pointer-events: none
}

.disabled-submit {
  background-color: #898e8d;
  pointer-events: none;
  margin-left: 1250px;
  margin-top: 40px;
}

.greetings a {
  margin-left: 1705px;
  margin-top: -55px;
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  color: #3f8756;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  background-color: #f2f5f6;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 130px;
  transition: all 0.5s ease;
}

.greetings a:hover {
  background-color: #75dc8f;
  color: #eaefe8;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  transform: translateY(-1.5px);
  cursor: pointer;
}

.logout-style {
  color: #333;
  text-decoration: none;
  font-weight: normal;
  padding: 8px 8px;
  border-radius: 5px;
  background-color: #f0f4f1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: inline-block;
  margin-top: 10px;
  margin-left: 6px;
}

.logout-style:hover {
  background-color: #f1f8f4;
  color: #00010b;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 2px solid #ddd;
}

.logout-icon {
  width: 38px;
  height: 38px;
  transition: transform 0.3s ease, filter 0.3s ease;
  object-fit: contain;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    pointer-events: none;
  }
}
</style>
