<script>
import {getCategories} from '../api/categories.js';
import {createComment, deleteComment, fetchComments} from '../api/comments.js';
import {addToCart, fetchGoods} from '../api/goods.js';
import {searchAddresses} from '../api/radar.js';
import {toggleLike} from '../api/likes.js';
import {listenCartUpdates} from '../plugins/echoCart'
import {listenChatUpdates} from '../plugins/echoChat'
import {listenChatDelete} from '../plugins/echoDelete';

import echo from '../plugins/echo.js'
import {userCategoryInfo} from "../api/user.js";


export default {
  name: "Categories",
  data() {
    return {

      message: '',
      newMessage: '',

      categories: [],

      selectedCategory: null,
      selectedCategoryId: null,
      comments: [],
      goods: [],
      commentText: '',
      isLoading: false,

      cartCount: 0,
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,

      showNotification: false,
      showError: false,
      notificationText: '',
      errorMessage: '',
      like: false,
      liked: false,
      receivedMessage: null,

      searchQuery: '',
      filteredCategories: [],

      username: localStorage.getItem('username') || 'Гость',
      role: localStorage.getItem('role') || null,
      email: localStorage.getItem('email'),
      user_id: localStorage.getItem('user_id'),

      query: '',
      suggestions: [],
      debounceTimer: null,

      hoveredImage: null,

    };
  },
  methods: {

    onHoverImage(image) {
      this.hoveredImage = image;
    },
    onLeaveImage() {
      this.hoveredImage = null;
    },

    fetchLocations() {
      if (!this.query || this.query.length < 3) {
        this.suggestions = [];
        return;
      }
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(async () => {
        this.suggestions = await searchAddresses(this.query);
      }, 200);
    },

    selectAddress(address) {
      this.query = address.formattedAddress;
      this.suggestions = [];
      console.log('Выбран адрес:', address);
    },

    async loadCart(user_id) {

      const data = await userCategoryInfo(user_id);

      this.totalItems = data.info.goods_count;
    },

    selectCategory(category) {
      this.selectedCategory = category;
      this.selectedCategoryId = category.id;
      this.currentPage = 1;
      this.loadComments().then(() => {
        console.log('Комментарии загружены');

      });
      this.loadGoods().then(() => {
        console.log('Товары загружены');
      });
    },

    toggleLike(good) {
      toggleLike(good.id).then(response => {
        good.liked = response.liked;
      });
    },

    async loadComments() {
      const response = await fetchComments({
        category_id: this.selectedCategoryId,
        page: this.currentPage,
      })
      this.comments = response.data;
      this.totalPages = response.meta.last_page;
    },
    async loadGoods() {
      if (!this.selectedCategoryId) {
        this.goods = [];
        return;
      }
      const response = await fetchGoods(this.selectedCategoryId);
      const likedIds = response.liked_ids;
      const goods = response.goods;

      this.goods = goods.map(good => ({
        ...good,
        liked: likedIds.includes(good.id)
      }));
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.loadComments();
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    cart() {
      this.$router.push('/cart');
    },
    profile() {
      this.$router.push('/profile');
    },
    goToGoodDetail(good) {
      this.$router.push({ name: 'GoodDetail', params: { id: good.id } });
    },
    userList() {
      this.$router.push('/users');
    },
    feedback() {
      this.$router.push('/email');
    },
    createGood() {
      this.$router.push('/create');
    },

    addToCart(productId) {
      addToCart(productId)
          .then(async () => {
            this.notificationText = 'Товар был успешно добавлен в корзину';
            this.showNotification = true;

            await this.loadCart();

            setTimeout(() => {
              this.showNotification = false;
            }, 3000);
          });
    },

    deleteCommentHandler(commentId) {
      deleteComment(commentId)
          .then(async () => {
            await this.loadComments();
            if (this.comments.length === 0) {
              this.currentPage--;
              await this.loadComments(this.currentPage);
            }
            this.notificationText = 'Комментарий был успешно удалён';
            this.showNotification = true;
            setTimeout(() => {
              this.showNotification = false;
            }, 3000);
          })
          .catch(error => {
            alert('Ошибка при удалении комментария');
            console.error(error);
          });
    },

    goToUserPage(userId) {
      this.$router.push({ name: 'UserProfile', params: { id: userId } });
    },

    async submitComment() {
      if (!this.commentText.trim()) {
        this.showError = true;
        this.errorMessage = 'Необходимо заполнить поле комментария';
        setTimeout(() => (this.showError = false), 3000);
        return;
      }
      await createComment({
        category_id: this.selectedCategoryId,
        comment: this.commentText
      });
    }
  },
  created() {
    getCategories().then(response => {
      if (response.success) {
        this.categories = response.data.data;
        this.selectCategory(this.categories[0]);
      }
    });
  },

  mounted() {
    const userId = localStorage.getItem('user_id');

    listenCartUpdates(userId, (data) => {
      this.cartCount = data.totalQuantity;
    });

    this.loadCart(userId);

    echo.channel('chat').listen('.message.sent', (e) => {
      console.log('Получено событие:', e);
      this.message = e.message;
    });

    listenChatUpdates(userId, async (event) => {
      this.isLoading = true;
      event.comment.username = event.username;

      if (this.comments.length + 1 > 5) {
        this.currentPage++;
      }

      await this.loadComments(this.currentPage);

      this.isLoading = false;

      this.commentText = '';
      this.notificationText = 'Комментарий был успешно добавлен';
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    });

    listenChatDelete((event) => {
      const deletedId = event.commentId;

      this.comments = this.comments.filter(comment => comment.id !== deletedId);

      if (this.comments.length === 0 && this.currentPage > 1) {
        this.currentPage--;
        this.loadComments(this.currentPage);
      }
    });
  },

  computed: {
    hasMorePages() {
      return this.currentPage < this.totalPages;
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
    filteredCategories() {
      const match = this.searchQuery.toLowerCase();
      return this.categories.filter(function (category) {
        return category.name.toLowerCase().includes(match);
      });
    }
  }
};

</script>
<template>
  <div class="page-wrapper">
    <div class="logout">
      <a href="/logout" class="logout-style" @click.prevent="logout">
        <img src="/images/interface/logout.png" alt="Выйти из аккаунта" class="logout-icon"/>
      </a>
      <a href="/users"
         id="userList"
         class="logout-style"
         @click.prevent="userList"
         v-if="role === 'admin'">
        Список пользователей
      </a>
      <a href="/create"
         id="userList"
         class="logout-style"
         @click.prevent="createGood"
         v-if="role === 'admin'">
        Создать товар
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

    <div class="email-icon">
      <a href="/email">
        <img src="/images/interface/mail.png" class="cart" @click.prevent="feedback" alt="Корзина">
      </a>
    </div>

    <label class="number-label">{{ this.cartCount || this.totalItems }}</label>

    <div class="cartIcon">
      <a href="/cart">
        <img src="/images/interface/cart.png" class="cart" @click.prevent="cart" alt="Корзина">
      </a>
    </div>
    <div class="table-container category-table">
      <img src="/images/interface/eye.png" alt="Выйти из аккаунта" class="eye"/>
      <table>
        <thead>
        <tr>
          <th>Категории</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="category in categories"
            :key="category.id"
            :class="{ selected: selectedCategoryId === category.id }"
            @click.prevent="selectCategory(category)"
        >
          <td>
            <a
                href=""
                class="categories"
                @click.prevent="selectCategory(category)"
            >
              {{ category.name }}
            </a>
          </td>
        </tr>
        </tbody>
      </table>

      <div class="autoComplete_wrapper" id="search">
        <input
            id="autoComplete"
            type="search"
            v-model="searchQuery"
            placeholder="Поиск категорий..."
        />
        <ul v-if="searchQuery && filteredCategories.length > 0" class="autocomplete-list">
          <li
              v-for="category in filteredCategories"
              :key="category.id"
              @click="selectCategory(category); searchQuery = ''"
              class="autocomplete-item"
          >
            {{ category.name }}
          </li>
        </ul>
      </div>
    </div>

    <div class="comments-table" id='comments'>
      <label class="category-name">
        {{ selectedCategory ? selectedCategory.name : 'Товары' }}
      </label>

      <div class="goods-list">
        <div class="goods-list-header">
          <div class="goods-list-cell goods-name">Товар</div>
          <div class="goods-list-cell goods-price">Цена</div>
          <div class="goods-list-cell goods-action"></div>
        </div>

        <div
            class="goods-list-row"
            v-for="good in goods"
            :key="good.id"
            @mouseenter="onHoverImage(good.image)"
            @mouseleave="onLeaveImage"
            @click="goToGoodDetail(good)"
        >
          <div class="goods-list-cell goods-name">{{ good.name }}
            <img
                :src="heartSrc(good)"
                id="heart"
                @click.stop="toggleLike(good)"
                style="cursor:pointer; margin-left:8px;"
                alt="Лайк"
            />
          </div>
          <div class="goods-list-cell goods-price">{{ good.price }}р</div>
          <div class="goods-list-cell goods-action">
            <button class="small-button" @click="addToCart(good.id)">+</button>
          </div>
        </div>
      </div>

      <div class="hover-image-preview" v-if="hoveredImage">
        <img :src="`http://laravelshop.loc/storage/${hoveredImage}`" alt="Предпросмотр товара">
      </div>

      <div class="places">
        <input class="container"
               v-model="query"
               @input="fetchLocations"
               placeholder="Введите адрес"
        />
        <ul v-if="suggestions.length">
          <li v-for="address in suggestions"
              :key="address.id || address.formattedAddress"
              @click="selectAddress(address)">
            {{ address.formattedAddress }}
          </li>
        </ul>
      </div>

      <table class="comments-table" id="usersComments" style="margin-top: 20px;">
        <thead>
        <tr>
          <th>Имя</th>
          <th>Комментарий</th>
          <th style="width: 25px"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="comment in comments" :key="comment.id">
          <td>

            <span
            v-if="role === 'admin'"
            class="username-link"
            @click="goToUserPage(comment.user_id)">
            {{ comment.username }}
            </span>
            <span v-else>
            {{ comment.username }}
            </span>

          </td>
          <td>{{ comment.content }}</td>
          <td class="action-column">
            <button class="small-comment-button" @click="deleteCommentHandler(comment.id)">-</button>
          </td>
        </tr>
        </tbody>
      </table>

      <form @submit.prevent="submitComment" class="table-container" id="first-form">
        <input type="hidden" name="name" :value="username"/>
        <div class="form-message">
          <label for="message"></label>
          <textarea
              id="message"
              name="message"
              v-model="commentText"
              placeholder="Введите ваш комментарий"
          ></textarea>
        </div>
        <div class="form-submit">

          <button v-if="isLoading" class="disabled-submit" disabled>
            Процесс
          </button>
          <button v-else type="submit">
            Принять
          </button>

        </div>
      </form>

      <div class="button-container">
        <button
            :class="{ disabled: currentPage === 1 }"
            @click="goToPage(currentPage - 1)"
        >
          <img src="/images/interface/back.png" alt="Назад" class="left-arrow"/>
        </button>

        <button
            :class="{ disabled: !hasMorePages }"
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
    </div>
  </div>

</template>

<style scoped>

.hover-image-preview {
  position: fixed;
  top: 150px;
  left: 340px;
  width: 200px;
  max-height: 300px;
  z-index: 1000;
  background: white;
  padding: 6px;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
}

.hover-image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.disabled-submit {
  background-color: #898e8d;
  pointer-events: none;
}

.username-link {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.username-link:hover {
  transform: scale(1.05);
  color: #0056b3;
}

.goods-list {
  flex-direction: column;
  width: 742px;
  margin-left: 80px;
  margin-top: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 239px;
  overflow-y: auto;
  font-family: Arial, sans-serif;
  font-size: 16px;
  background-color: #f9fbfd;
}

.goods-list-header, .goods-list-row {
  display: flex;
  border-bottom: 1px solid #ddd;
  padding: 8px 12px;
}

.goods-list-row {
  position: relative;
  transition: background-color 0.2s ease, transform 0.2s ease;
  cursor: pointer;
  padding: 7px 14px;
  background: linear-gradient(145deg, #ffffff, #f1f4f7);
}

.goods-list-row:hover {
  background: linear-gradient(145deg, #f7f8fa, #ffffff);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.goods-list-header {
  font-weight: bold;
  background-color: #f9f9f9;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 12px 13px;
  border-radius: 10px;
  font-family: 'Segoe UI', sans-serif;
}

.goods-list-cell {
  padding: 0 8px;
  display: flex;
  align-items: center;
}

.goods-name {
  flex: 2;
}

.goods-price {
  flex: 1;
  text-align: right;
}

.goods-action {
  width: 40px;
  text-align: center;
}

#heart {
  width: 20px;
  height: auto;
  margin-left: 8px;
}

.small-button {
  width: 26px;
  height: 26px;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.small-button:hover {
  background-color: #e6e6e6;
}

.autocomplete-list {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  width: 92%;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  list-style-type: none;
  padding-left: 0;
}

.autocomplete-item {
  padding: 8px 12px;
  cursor: pointer;
}

.autocomplete-item:hover {
  background-color: #f0f0f0;
}

.button-container {
  display: flex;
  justify-content: center;
  max-width: 20px;
  margin-left: 172px;
  margin-top: 13px;
  gap: 20px;
}

#userList {
  margin-left: 7px;
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

textarea {
  height: 250px;
  width: 745px;
  padding: 14px 18px;
  font-size: 16px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fdfdfd;
  border: 1px solid #ccc;
  border-radius: 12px;
  box-sizing: border-box;
  margin-left: -1067px;
  margin-top: 185px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05),
  0 2px 8px rgba(0, 0, 0, 0.06);
  resize: none;
  transition: all 0.3s ease;
  position: static;
}

textarea:focus {
  border-color: #5b8dea;
  outline: none;
  background-color: #fff;
  box-shadow: 0 0 8px rgba(107, 191, 140, 0.4);
}

.form-submit {
  margin-top: 504px;
  margin-left: -1017px;
  display: block;
  transition: 0.5s;
}

#message {
  margin-left: -1063px;
}

.table-container {
  position: fixed;
  margin-top: 51px;
  margin-left: 17px;
  width: 15%;
  max-width: 900px;
  border-collapse: collapse;
  display: inline-block;
}

.categories {
  display: block;
  height: 43px;
  margin-left: 14px;
}

.category-table table {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-top: -140px;
  margin-left: 8px;
  font-family: 'Arial', sans-serif;
}

.comments-table table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  margin-left: 80px;
  margin-top: 10px;
  background-color: #fff;
  font-family: 'Arial', sans-serif;
}

.category-name {
  margin-left: 80px;
  margin-top: -35px;
  padding-bottom: -50px;
  font-size: 36px;
  font-family: Lora,serif;
}

.comments-table th, .comments-table td {
  border-right: 1px solid #ddd;
  padding: 10px 10px;
  text-align: left;
  font-size: 16px;
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

.selected td {
  outline: 2px solid #4CAF50;
  background-color: #e8f5e9;
  transition: all 0.3s ease;
}

.comments-table th {
  background-color: #f4f4f4;
  color: #333;
  font-weight: bold;
  border-bottom: 2px solid #ddd;
}

.comments-table td {
  background-color: #fafafa;
}

button.small-comment-button {
  font-size: 22px;
  padding: 0.1px 8px;
  height: 26.4px;
  border-radius: 3px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.5s;
}

button.small-button {
  font-size: 16px;
  padding: 1px 7px;
  height: 24.4px;
  border-radius: 3px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.5s;
}

button.small-button:active {
  background-color: #a6a3a3;
  scale: 1.1;
}

table#goods td.action-column {
  width: 1%;
  white-space: nowrap;
  text-align: right;
  padding: 4px;
}

table#usersComments td.action-column {
  width: 1%;
  white-space: nowrap;
  text-align: right;
  padding: 4px;
}

#comments {
  margin-top: -10px;
  margin-left: 480px;
  width: 40%;
  max-width: 900px;
  border-collapse: collapse;
  display: inline-block;
}

.places {
  position: absolute;
  margin-left: 560px;
  margin-top: -297px;
  border-radius: 30px;
  width: 520px;
  z-index: 1000;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.places ::v-deep input {
  border-radius: 30px !important;
}

#first-form {
  display: flex;
  justify-content: center;
  max-width: 20px;
  margin-left: 970px;
  margin-top: -175px;
}

th {
  padding: 15px;
  text-align: left;
  font-size: 1.2em;
}

thead {
  background-color: #eaeaea;
  font-weight: bold;
}

td:focus {
  background-color: #e0f7fa;
}

td {
  cursor: pointer;
  text-align: left;
  font-size: 1.2em;
  padding-top: 10px;
}

tbody tr {
  border-bottom: 1px solid #ddd;
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

.category-table tbody td:hover {
  background-color: #f8f8f8;
  transform: scale(1.03);
  transition: all 0.05s ease-in-out;
}

.category-table tbody td {
  cursor: pointer;
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

#search {
  margin-top: 15px;
  margin-left: 9px;
  width: 300px;
  position: relative;
  font-family: 'Roboto', sans-serif;
}

.autoComplete_wrapper > input {
  width: 92%;
  padding: 10px 40px 10px 40px;
  border: 1px solid #cad9dd;
  border-radius: 10px;
  font-size: 1em;
  color: #333;
  background-color: #fff;
  background-image: url('/images/interface/search.png');
  background-repeat: no-repeat;
  background-size: 24px 24px;
  background-position: 12px center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  outline: none;
  box-sizing: border-box;
}

.autoComplete_wrapper > input::placeholder {
  color: #a3bfb0 !important;
  font-style: italic;
}

.autoComplete_wrapper > input:focus {
  border-color: #789f74;
  box-shadow: 0 0 8px rgba(120, 159, 116, 0.7);
  background-color: #fefefe;
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

.disabled {
  background-color: #898e8d;
  pointer-events: none
}

label {
  margin-top: 60px;
  font-size: 18px;
  color: #333;
  display: block;
  text-align: left;
  margin-left: 556px;
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

.email-icon {
  margin-left: 1580px;
  margin-top: -50px;
  position: absolute;
}


.logout-icon {
  width: 38px;
  height: 38px;
  transition: transform 0.3s ease, filter 0.3s ease;
  object-fit: contain;
}

.eye {
  margin-left: 10px;
  margin-bottom: 130px;
  margin-top: -20px;
  width: 55px;
  height: 55px;
  transition: transform 0.3s ease, filter 0.3s ease;
  object-fit: contain;
}

.container {
  width: 100%;
  padding: 8px 14px;
  font-size: 18px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  border: 2px solid #ddd;
  border-radius: 30px;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  outline: none;
  background-color: #fafafa;
  color: #333;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.container:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 8px rgba(74, 144, 226, 0.6);
  background-color: #fff;
}

ul {
  list-style: none;
  margin: 5px 0 0 0;
  padding: 0;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 0 0 15px 15px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

li {
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 16px;
  color: #333;
}

li:hover {
  background-color: #e6f0ff;
}

</style>
