<script>
import {loadAllUsers, deleteUser} from "../api/user.js";
import {loadUserCart} from "../api/goods.js";
import {loadUserComments} from "../api/user.js";

export default {
  data() {
    return {
      users: [],
      currentUserPage: 1,
      currentCommentsPage: 1,
      currentGoodsPage: 1,
      totalUserPages: 0,
      totalCommentsPages: 1,
      totalGoodsPages: 1,
      allGoods: 0,

      comments: [],
      username: '',
      role: '',
      user_id: null,
      totalGoodsCount: 0,
      totalCommentsCount: 0,
      isUserInfoLoaded: false,

      cartItems: [],
      totalPrice: 0,

      isComments: true,

      showNotification: false,
      notificationText: '',
      showError: false,
      errorMessage: '',
    };
  },
  methods: {
    async loadUserCommentsFromServer(page = 1) {
      const response = await loadUserComments(this.user_id, page);
      if (response.success) {
        this.totalCommentsPages = response.user.comments.meta.last_page;
        this.comments = response.user.comments.data;
        this.totalGoodsCount = response.user.comments.cart_items_count;
        this.user_id = response.user.id
        this.username = response.user.name;
        this.role = response.user.role;
      }
      this.isUserInfoLoaded = true;
    },

    async loadUserCartFromServer(page = 1) {
      const response = await loadUserCart(this.user_id, page);
      if (response.success) {
        this.totalGoodsPages = response.user.goods.meta.last_page;
        this.totalGoodsCount = response.user.goods.meta.total;
        this.cartItems = response.user.goods.data.cart;
        this.totalPrice = response.user.total_sum;
        this.totalCommentsCount = response.user.comments_count;
        this.username = response.user.name;
        this.user_id = response.user.id
        this.role = response.user.role;
      }
      this.isUserInfoLoaded = true;
    },

    goToCommentPage(page) {
      if (page < 1 || page > this.totalCommentsPages) return;
      this.currentCommentsPage = page;
      this.loadUserCommentsFromServer(page)
    },

    goToCartPage(page) {
      if (page < 1 || page > this.totalGoodsPages) return;
      this.currentGoodsPage = page;
      this.loadUserCartFromServer(page)
    },

    userCart(page = 1) {
      this.isComments = false;
      this.loadUserCartFromServer(page = 1)
    },

    userInfo(page = 1) {
      this.isComments = true;
      this.loadUserCommentsFromServer(page = 1)
    },

    categories() {
      this.$router.push('/categories');
    },

   async deleteUser() {

      const response = await deleteUser(this.user_id);
      if(response.success) {
        this.notificationText = "Пользователь был успешно удалён";
        this.showNotification = true;
        this.goToProfile(1)
        this.fetchUsers(this.currentUserPage);

        setTimeout(() => {this.showNotification = false;}, 3000);}
      else {
        this.errorMessage = "Ошибка при удалении этого пользователя";
        this.showError = true;

        setTimeout(() => {this.showNotification = false;}, 3000);
      }
    },

    async fetchUsers(page) {
      this.currentUserPage = page;
      const result = await loadAllUsers(page);
      if (result.success) {
        this.users = result.users;
        this.totalUserPages = result.meta.total_pages;
      }
    },

    goToProfile(userId, page = 1) {
      this.user_id = userId;
      this.isUserInfoLoaded = false;
      this.currentCommentsPage = 1;
      this.currentGoodsPage = 1;

      this.loadUserCommentsFromServer(page = 1);
      this.loadUserCartFromServer(page = 1);
    },
  },

  computed: {
    hasMoreCommentsPages() {
      return this.currentCommentsPage < this.totalCommentsPages;
    },
    hasMoreGoodsPages() {
      return this.currentGoodsPage < this.totalGoodsPages;
    },
    avatarSrc() {
      return this.role === 'guest'
          ? '/images/userIcon/guest.png'
          : '/images/userIcon/admin.png';
    },
  },

  mounted() {
    this.user_id = this.$route.params.id || 1;
    this.fetchUsers(this.currentUserPage);
    this.loadUserCommentsFromServer();

    if (this.$route.query.userId) {
      this.loadUserComments(this.$route.query.userId);
    }

  },
};
</script>

<template>
  <div class="logout">
    <a href="/categories" class="logout-style" @click.prevent="categories">
      <img src="/images/interface/back.png" alt="Выйти" class="logout-icon" />
    </a>
  </div>

  <img
      v-if="isUserInfoLoaded"
      class="person-img"
      :src="avatarSrc"
      alt="Аватар"
      id="avatar"
      style="transform: scaleX(-1);"
  />
  <h1 style="visibility: hidden">Личный кабинет</h1>
  <p v-if="isUserInfoLoaded">
    {{ username }} ({{ role === 'guest' ? 'Пользователь' : 'Администратор' }})
  </p>
  <p v-else>Загрузка...</p>

  <div v-if="showNotification" class="notification">
    {{ notificationText }}
  </div>
  <div v-if="showError" class="notification-wrong">
    {{ errorMessage }}
  </div>

  <div class="user-list-container">
    <h3 class="user-list-title">Пользователи</h3>
    <div class="user-list">
      <div
          v-for="user in users"
          :key="user.id"
          class="user-item"
          @click="goToProfile(user.id, 1)"
      >
        {{ user.name }}
      </div>
      <div v-if="users.length === 0" class="user-item">Пользователи не найдены</div>
    </div>
  </div>

  <div v-if="isComments">
    <div v-if="isUserInfoLoaded">
      <div class="logout">
        <a
            id="goodsButton"
            href="/logout"
            class="logout-style"
            @click.prevent="userCart"
        >
          Товары({{ totalGoodsCount }})
        </a>
      </div>

      <table id="comments" style="margin-top: 20px;">
        <thead>
        <tr>
          <th>Комментарии</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="comment in comments" :key="comment.id">
          <td>{{ comment.content }}</td>
        </tr>
        </tbody>
      </table>

      <div class="button-container">
        <button
            :class="{ disabled: currentCommentsPage === 1 }"
            class="previous-page"
            @click="goToCommentPage(currentCommentsPage - 1)"
        >
          <img src="/images/interface/back.png" alt="Назад" class="left-arrow" />
        </button>

        <button
            :class="{ disabled: !hasMoreCommentsPages }"
            class="next-page"
            @click="goToCommentPage(currentCommentsPage + 1)"
        >
          <img
              src="/images/interface/back.png"
              alt="Вперёд"
              class="right-arrow"
              style="transform: scaleX(-1)"
          />
        </button>
      </div>

      <button
          v-if="role !== 'admin'"
          class="exitButton"
          @click.prevent="deleteUser"
      >
        Удалить
      </button>

    </div>
  </div>

  <div v-if="!isComments">
    <div v-if="isUserInfoLoaded">
      <div class="logout">
        <a
            id="commentsButton"
            href="/profile"
            class="logout-style"
            @click.prevent="userInfo"
        >
          Комментарии({{ totalCommentsCount }})
        </a>
      </div>
      <table class="comments-table" id="usersComments" style="margin-top: 10px;">
        <thead>
        <tr>
          <th>Корзина</th>
          <th>Кол-во</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="cartItems.length === 0">
          <td colspan="4" style="text-align: left; font-style: italic; color: #888;">
            Пусто
          </td>
        </tr>
        <tr v-for="item in cartItems" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.quantity }}</td>
        </tr>
        </tbody>
      </table>

      <div class="button-container">
        <button
            :class="{ disabled: currentGoodsPage === 1 }"
            class="previous-page"
            @click="goToCartPage(currentGoodsPage - 1)"
        >
          <img src="/images/interface/back.png" alt="Назад" class="left-arrow" />
        </button>

        <button
            :class="{ disabled: !hasMoreGoodsPages }"
            class="next-page"
            @click="goToCartPage(currentGoodsPage + 1)"
        >
          <img
              src="/images/interface/back.png"
              alt="Вперёд"
              class="right-arrow"
              style="transform: scaleX(-1)"
          />
        </button>
      </div>

      <button
          v-if="role !== 'admin'"
          class="exitButton"
          @click.prevent="deleteUser"
      >
        Удалить
      </button>

    </div>
    <label>Итог: {{ totalPrice }} ₽</label>
  </div>
</template>

<style scoped>
#avatar {
  position: absolute;
  margin-left: 885px;
}

label {
  margin-top: -110px;
  margin-left: 800px;
  position: fixed;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  width: fit-content;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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

  margin-top: 18px;
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

#goodsButton {
  margin-left: 1258px;
  margin-bottom: -50px;
  margin-top: -680px;
}

#commentsButton {
  margin-left: 1214px;
  margin-top: -6px;
}

table {
  width: 650px;
  margin-left: 700px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 6px;
}

table td {
  padding: 14px 20px;
  text-align: left;
  font-family: 'Arial', sans-serif;
  font-size: 1em;
  border-left: 1px solid #ecf0f1;
}

table th {
  background-color: #34495e;
  color: #ffffff;
  font-weight: bold;
  text-transform: uppercase;
  padding: 14px 20px;
  text-align: left;
  font-family: 'Arial', sans-serif;
  font-size: 1em;
  border-left: 1px solid #ecf0f1;
}

.right-arrow {
  width: 35px;
  margin-left: -2px;
  margin-top: -8px;
  height: 35px;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.left-arrow {
  width: 35px;
  margin-left: -5px;
  margin-top: -9px;
  height: 35px;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.button-container {
  display: flex;
  justify-content: space-between;
  max-width: 70px;
  margin-left: 700px;
  margin-top: 15px;
  gap: 465px;
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
  background-color: #90dcea;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.disabled {
  background-color: #898e8d;
  pointer-events: none;
}

p {
  text-align: center;
  font-size: 2.0em;
  color: #34495e;
  margin-top: 220px;
  margin-left: 230px;
  line-height: 1.6;
  font-family: 'Arial', sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1),
  0 0 6px rgba(108, 198, 192, 0.3);
  font-weight: 600;
}

.user-list-container {
  width: 280px;
  position: fixed;
  height: 520px;
  margin-left: 30px;
  margin-top: -250px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

.comments-table td:nth-child(2),
.comments-table th:nth-child(2) {
  width: 55px;
  text-align: center;
  white-space: nowrap;
}

.user-list {
  padding: 10px;
  max-height: 450px;
  overflow-y: auto;
}

.user-list-title {
  text-align: center;
  background-color: #34495e;
  color: white;
  padding: 12px;
  margin: 0;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  font-size: 1.1em;
}

.user-item {
  padding: 14px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
}

.user-item:hover {
  background-color: #f0f0f0;
}

.exitButton {
  background-color: #e74c3c;
  color: white;
  font-size: 1.1em;
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;
  margin-left: 960px;
}

.exitButton:hover {
  background-color: #c0392b;
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

</style>
