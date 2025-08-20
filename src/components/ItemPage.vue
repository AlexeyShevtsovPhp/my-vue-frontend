<script>
import {addToCart, fetchGoodInfo} from '../api/goods.js';
import {buy} from "../api/purchase.js";
import {listenCartUpdates} from "../plugins/echoCart.js";
import {userCategoryInfo} from "../api/user.js";

export default {
  data() {
    return {

      cartCount: 0,
      totalItems: 0,

      showNotification: false,
      showError: false,
      notificationText: '',
      errorMessage: '',

      goodId: null,
      goodInfo: [],

      username: localStorage.getItem('username') || 'Гость',
      role: localStorage.getItem('role') || null,
      email: localStorage.getItem('email'),
      userId: localStorage.getItem('user_id'),

    };
  },
  methods: {

    categories() {
      this.$router.push('/categories');
    },

    profile() {
      this.$router.push('/profile');
    },

    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },

    async loadInfo() {
      const response = await fetchGoodInfo(this.goodId);
      this.goodInfo = response.item;
    },

    cart() {
      this.$router.push('/cart');
    },

    addToCart(productId) {
      addToCart(productId)
          .then(async () => {
            this.notificationText = 'Товар был успешно добавлен в корзину';
            this.showNotification = true;

            setTimeout(() => {
              this.showNotification = false;
            }, 3000);
          });
    },

    async loadCart(user_id) {

      const data = await userCategoryInfo(user_id);

      this.totalItems = data.info.goods_count;
    },

  },

  mounted() {
    const userId = localStorage.getItem('user_id');

    listenCartUpdates(userId, (data) => {
      this.cartCount = data.totalQuantity;

      this.loadCart(userId);

    });
  },

  computed: {
    avatarSrc() {
      return this.role === 'guest'
          ? '/images/userIcon/guest.png'
          : '/images/userIcon/admin.png';
    },
  },

  created() {
    this.goodId = this.$route.params.id;
    this.loadInfo();
    const userId = localStorage.getItem('user_id');
    this.loadCart(userId);
  }

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
      <img :src="avatarSrc" class="avatar" style="transform: scaleX(-1);" alt="none">
      <span class="user-name">{{ username }}</span>
    </a>
  </div>

  <div v-if="showNotification" class="notification">
    {{ notificationText }}
  </div>
  <div v-if="showError" class="notification-wrong">
    {{ errorMessage }}
  </div>

  <label class="number-label">{{ this.cartCount || this.totalItems }}</label>

  <div class="cartIcon">
    <a href="/cart">
      <img src="/images/interface/cart.png" class="cart" @click.prevent="cart" alt="Корзина">
    </a>
  </div>

  <div class="product-detail" v-if="goodInfo">
    <img
        :src="`http://laravelshop.loc/storage/${goodInfo.image}`"
        alt="Изображение товара"
        class="product-image"
    />

    <div class="product-info">
      <h1 class="product-name">{{ goodInfo.name }}</h1>
      <p class="product-price">{{ goodInfo.price }} ₽</p>
      <p class="product-date">Добавлен: {{ formatDate(goodInfo.created_at) }}</p>
    </div>
  </div>

  <div class="button-wrapper">
  <button class="add-to-cart-btn" @click="addToCart(goodInfo.id)">
    🛒 Добавить в корзину
  </button>
  </div>

</template>

<style scoped>

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

.logout-icon {
  width: 38px;
  height: 38px;
  transition: transform 0.3s ease, filter 0.3s ease;
  object-fit: contain;
}

.button-wrapper {
  padding-bottom: 40px;
  margin-top: -15px;
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

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 2px solid #ddd;
}

.product-detail {
  max-width: 800px;
  margin: 60px auto;
  padding: 24px;
  background-color: #fdfdfd;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.product-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 24px;
}

.product-info {
  font-family: 'Segoe UI', sans-serif;
  color: #333;
}

.product-name {
  font-size: 28px;
  margin-bottom: 10px;
}

.product-price {
  font-size: 24px;
  color: #2c7a4b;
  margin-bottom: 8px;
}

.product-date {
  font-size: 14px;
  color: #777;
}

.add-to-cart-btn {
  padding: 14px 30px;
  font-size: 19px;
  background: linear-gradient(45deg, #ff6a00, #ee0979);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 8px 15px rgba(238, 9, 121, 0.4);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  margin-left: 780px;
  margin-top: -70px;
}

.add-to-cart-btn:hover {
  box-shadow: 0 12px 25px rgba(238, 9, 121, 0.7);
  transform: scale(1.05);
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

.cart {
  width: 41px;
  height: 41px;
  margin-right: 10px;
  margin-top: -2px;
  border-radius: 8px;
  background-color: #f2f5f6;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 60%;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding: 5px;
  box-shadow: 1px 3px 6px rgba(0, 0, 0, 0.15);
}

.cart:hover {
  background-color: #dce0f8;
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.cartIcon {
  margin-left: 1640px;
  margin-top: -50px;
  position: absolute;
}

.number-label {
  position: absolute;
  background-color: #eee;
  color: #555;
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 8px;
  opacity: 0.7;
  user-select: none;
  pointer-events: none;
  font-weight: 600;
  font-family: Arial, sans-serif;
  transition: opacity 0.3s ease;
  margin-left: 1675px;
  margin-top: -10px;
  z-index: 9999;
}

</style>
