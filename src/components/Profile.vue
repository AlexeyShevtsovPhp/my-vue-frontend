<script>

import {loadUserCart} from "../api/goods.js";
import {loadUserComments} from "../api/user.js";
import {toggleLike} from "../api/likes.js";

export default {
  data() {
    return {
      liked: [],

      allGoods: 0,
      totalCommentsCount: 0,
      totalLikesCount: 0,

      comments: [],

      cartItems: [],
      totalPrice: 0,
      likedGoods: [],

      username: localStorage.getItem('username') || 'Гость',
      role: localStorage.getItem('role') || null,
      user_id: Number(localStorage.getItem('user_id')),

      currentCommentsPage: 1,
      currentGoodsPage: 1,

      totalCommentsPages: 1,
      totalGoodsPages: 1,
      totalGoodsCount: 0,

      isUserInfoLoaded: false,

      isComments: true,
      isLikesPage: false,
    }
  },
  methods: {

    async loadUserCommentsFromServer(page = 1) {
      const response = await loadUserComments(this.user_id, page);
      if (response.success) {
        this.totalCommentsPages = response.user.comments.meta.last_page;
        this.totalGoodsCount = response.user.comments.cart_items_count;
        this.comments = response.user.comments.data;
        this.allGoods = response.user.comments.cart_items_count;
        this.username = response.user.name;
        this.role = response.user.role;
      }
      this.isUserInfoLoaded = true;
    },

    async loadUserCartFromServer(page = 1) {
      const response = await loadUserCart(this.user_id, page);
      if (response.success) {
        this.totalGoodsPages = response.user.goods.meta.last_page;
        this.cartItems = response.user.goods.data.cart;
        this.totalPrice = response.user.total_sum;
        this.totalCommentsCount = response.user.comments_count;
        this.totalLikesCount = response.user.goods.data.likes_count;
        this.likedGoods = response.user.goods.data.liked.map(good => ({
          ...good,
          liked: true
        }));
        this.username = response.user.name;
        this.role = response.user.role;
      }
      this.isUserInfoLoaded = true;
    },

    goToCommentPage(page) {
      if (page < 1 || page > this.totalCommentsPages) return;
      this.currentCommentsPage = page;
      this.loadUserCommentsFromServer(page);
    },

    goToCartPage(page) {
      if (page < 1 || page > this.totalGoodsPages) return;
      this.currentGoodsPage = page;
      this.loadUserCartFromServer(page);
    },

    userCart(page = 1) {
      this.isComments = false;
      this.loadUserCartFromServer(page);
    },

    userInfo() {
      this.isComments = true;
      this.isLikesPage = false;
    },

    backToCart() {
      this.isLikesPage = false;
    },

    userLikesList() {
      this.isLikesPage = true;
    },

    toggleLike(good) {
      toggleLike(good.id).then(response => {
        good.liked = response.liked;
      });
    },

    categories() {
      this.$router.push('/categories');
    },

    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },

  },
  mounted() {
    this.loadUserCommentsFromServer();
  },

  computed: {
    hasMoreCommentsPages() {
      return this.currentCommentsPage < this.totalCommentsPages;
    },
    hasMoreGoodsPages() {
      return this.currentGoodsPage < this.totalGoodsPages;
    },

    heartSrc() {
      return (good) => {
        return good.liked
            ? '/images/interface/heart.png'
            : '/images/interface/heartVoid.png';
      }
    },

    avatarSrc() {
      return this.role === 'guest'
          ? '/images/userIcon/guest.png'
          : '/images/userIcon/admin.png';
    },
  },
}
</script>

<template>
  <div class="page-wrapper">

    <div class="logout">
      <a href="/logout" class="logout-style" @click.prevent="categories">
        <img src="/images/interface/back.png" alt="Выйти из аккаунта" class="logout-icon"/>
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

    <div v-if="isComments">
      <div v-if="isUserInfoLoaded">

        <div class="logout">
          <a
              id="goodsButton"
              href="/logout"
              class="logout-style"
              @click.prevent="() => userCart(1)"
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
          <tr v-if="comments.length === 0">
            <td colspan="4" style="text-align: left; font-style: italic; color: #888;">
              Пусто
            </td>
          </tr>
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
        <a href='/logout'>
          <button class="exitButton" @click.prevent="logout">Выйти</button>
        </a>
      </div>
    </div>

    <div v-if="!isComments">
      <div v-if="isUserInfoLoaded">
        <div class= "wrapper">
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
        </div>

        <div v-if="!isLikesPage">
        <div class="logout">
          <a
              id="favorite"
              href="/profile"
              class="logout-style"
              @click.prevent="userLikesList"
          >
            Избранные товары({{ totalLikesCount }})
          </a>
        </div>
        </div>

        <div v-if="isLikesPage">
          <div class="logout">
            <a
                id="justCart"
                href="/profile"
                class="logout-style"
                @click.prevent="backToCart"
            >
              Товары({{ totalGoodsCount }})
            </a>
          </div>
        </div>

        <div v-if="!isLikesPage">
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
          <label>Итог: {{ totalPrice }} ₽</label>

          <a href='/logout'>
            <button class="exitButton" @click.prevent="logout">Выйти</button>
          </a>

        </div>
      </div>
    </div>

        <div v-if="isLikesPage">
          <div class="liked-vertical-container">
              <h3 class="like-list-title">Избранные товары</h3>

            <div class="like-list">
              <div
                  v-if="likedGoods.length === 0"
                  class="empty-message"
              >
                Пусто
              </div>
              <div
                  v-else
                  class="liked-item"
                  v-for="good in likedGoods"
                  :key="good.id"
              >
                <span class="good-name">{{ good.name }}</span>
                <img
                    :src="heartSrc(good)"
                    id="heart"
                    class="heart-icon"
                    @click="toggleLike(good)"
                    style="cursor:pointer; margin-left:8px;"
                    alt="Лайк"
                />
              </div>
            </div>

          </div>

          <div class="likeExit">
          <a href='/logout'>
            <button class="exitButton" @click.prevent="logout">Выйти</button>
          </a>
          </div>
        </div>

  </div>
</template>

<style scoped>

.liked-vertical-container {
  width: 650px;
  max-height: 280px;
  padding: 0;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  margin-left: 604px;
  margin-top: 10px;
}

.liked-vertical-container::-webkit-scrollbar {
  width: 8px;
}

.liked-vertical-container::-webkit-scrollbar-thumb {
  background-color: #bbb;
  border-radius: 10px;
}

.liked-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid #eee;
  font-family: 'Arial', sans-serif;
  font-size: 1em;
  transition: background-color 0.2s ease;
}

.liked-item:hover {
  background-color: #f9f9f9;
}

.good-name {
  flex: 1;
}

.heart-icon {
  width: 22px;
  height: 22px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.heart-icon:hover {
  transform: scale(1.2);
  opacity: 0.7;
}

.empty-message {
  text-align: center;
  font-size: 1.2em;
  padding: 20px;
  color: #888;
  font-style: italic;
}

#justCart {
  position: absolute;
  margin-top: -34px;
  margin-left: 1015px;
}

.like-list {
  overflow-y: auto;
  flex-grow: 1;
  max-height: 245px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.like-list::-webkit-scrollbar {
  width: 8px;
}

.like-list::-webkit-scrollbar-thumb {
  background-color: #bbb;
  border-radius: 10px;
}

.like-list-title{
  background-color: #34495e;
  color: #ffffff;
  padding: 14px 20px;
  margin: 0;
  font-size: 1em;
  text-transform: uppercase;
  font-family: 'Arial', sans-serif;
}

#goodsButton {
  margin-left: 1165px;
  margin-bottom: -50px;
  margin-top: -20px;
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

p {
  text-align: center;
  font-size: 2.0em;
  color: #34495e;
  margin-top: 220px;
  margin-left: 3px;
  line-height: 1.6;
  font-family: 'Arial', sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1),
  0 0 6px rgba(108, 198, 192, 0.3);
  font-weight: 600;
}

.person-img {
  position: absolute;
  left: 42%;
  top: 8%;
}

table {
  width: 650px;
  margin-bottom: 100px;
  margin-left: 603px;
  position: static;
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
  margin-left: 605px;
  margin-top: -85px;
  gap: 460px;
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
  pointer-events: none
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
  margin-left: 865px;
}

.exitButton:hover {
  background-color: #c0392b;
}

#goodsButton {
  margin-left: 1161px;
  margin-bottom: -50px;
  margin-top: -680px;
}

#commentsButton{
  margin-left: 1117px;
  margin-top: -6px;
}

#favorite {
  margin-left: 935px;
  margin-top: -34px;
  position: absolute;
}

.comments-table td:nth-child(2),
.comments-table th:nth-child(2) {
  width: 55px;
  text-align: center;
  white-space: nowrap;
}

label {
  margin-top: -45px;
  margin-left: 708px;
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

.likeExit {
  margin-top: 56px;
}

</style>
