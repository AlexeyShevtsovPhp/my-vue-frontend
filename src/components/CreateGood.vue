<script>
import {getCategories} from "../api/categories.js";
import {change, fetchGoods} from "../api/goods.js";
import {create} from "../api/goods.js";

export default {
  data() {
    return {
      currentPage: 1,
      totalPages: 1,

      categories: [],
      goods: [],

      product: {
        name: '',
        price: '',
        category_id: '',
      },

      imageFile: null,
      imageFileChange : null,

      selectedCategory: null,
      selectedCategoryId: null,
      selectedGoodId: null,

      categoriesToChange: [],

      productToChange: {
        name: '',
        price: '',
        category_id: ''
      },

      showNotificationCreate: false,
      notificationTextCreate: '',
      showErrorCreate: false,
      errorMessageCreate: '',

      showNotificationChange: false,
      notificationTextChange: '',
      showErrorChange: false,
      errorMessageChange: '',

      username: localStorage.getItem('username') || 'Гость',
      role: localStorage.getItem('role') || null,
    }
  },
  methods: {
    profile() {
      this.$router.push('/profile');
    },

    handleImageUpload(event) {
      this.imageFile = event.target.files[0];
    },

    handleImageUploadChange(event) {
      this.imageFileChange = event.target.files[0];
    },

    async submitProduct() {

      const formData = new FormData();
      formData.append('name', this.product.name);
      formData.append('price', this.product.price);
      formData.append('category_id', this.product.category_id);
      if (this.imageFile) {
        formData.append('image', this.imageFile);
      }
      try {
        const response = await create(formData);
        if (response.success) {
          this.notificationTextCreate = 'Новый товар был успешно создан';
          this.showNotificationCreate = true;
          setTimeout(() => {
            this.showNotificationCreate = false;
          }, 3000);
          this.product.name = '';
          this.product.price = '';
          this.imageFile = null;
          this.$refs.imageInput.value = '';
        }
      } catch (error) {
        const errors = error.response.data.errors;
        if (errors) {
          this.errorMessageCreate = Object.values(errors)[0][0];
        }
        this.showErrorCreate = true;
        setTimeout(() => {
          this.showErrorCreate = false;
        }, 3000);
      }
    },

    async changeProduct() {

      const formData = new FormData();
      formData.append('name', this.productToChange.name);
      formData.append('price', this.productToChange.price);
      formData.append('category_id', this.productToChange.category_id);
      if (this.imageFileChange) {
        formData.append('image', this.imageFileChange);
      }
      try {
        const response = await change(this.selectedGoodId, formData);
        if (response.success) {
          this.notificationTextChange = 'Товар был успешно изменен';
          this.showNotificationChange = true;
          setTimeout(() => {
            this.showNotificationChange = false;
          }, 3000);

          await this.loadGoods();
          this.productToChange.name = '';
          this.productToChange.price = '';
          this.imageFileChange = null;
          this.$refs.imageInputChange.value = '';
          }
        }
      catch (error) {
        const errors = error.response.data.errors;
        if (errors) {
          this.errorMessageChange = Object.values(errors)[0][0];
        } else {
          this.errorMessageChange = 'Необходимо что-то изменить';
        }
        this.showErrorChange = true;
        setTimeout(() => {
          this.showErrorChange = false;
        }, 3000);
      }
    },

    async loadGoods() {
      const response = await fetchGoods(this.selectedCategoryId || 1);
      this.goods = response.goods ?? [];

      if (this.goods.length > 0) {
        this.selectedGoodId = this.goods[0].id;
      } else {
        this.selectedGoodId = null;
      }
    if (this.goods.length > 0) {
        this.selectedGoodId = this.goods[0].id;
      }
    },

    async fetchCategories() {
      const response = await getCategories()
      if (response.success) {
        this.categories = response.data.data;
        this.categoriesToChange = response.data.data;
        this.product.category_id = this.categories[0].id;
        this.productToChange.category_id = this.categories[0].id;
      }
    },

    selectCategory(event) {
      this.selectedCategoryId = event.target.value;
      this.currentPage = 1;
      this.loadGoods().then(() => {
        console.log('Товары загружены');
      });
    },

    categoriesGo() {
      this.$router.push('/categories');
    },
  },

  async mounted() {
    await this.fetchCategories()
    await this.loadGoods()
  },
  watch: {
    selectedGoodId(newId) {
      const selected = this.goods.find(function (good) {
        return good.id === newId;
      });
      if (selected) {
        this.productToChange.name = selected.name;
        this.productToChange.price = selected.price;
        this.productToChange.category_id = selected.category_id;
      }
    }
  },
  computed: {
    avatarSrc() {
      return this.role === 'guest'
          ? '/images/userIcon/guest.png'
          : '/images/userIcon/admin.png';
    },
  }
}

</script>
<template>
  <div class="logout">
    <a href="/logout" class="logout-style" @click.prevent="categoriesGo">
      <img src="/images/interface/back.png" alt="Выйти из аккаунта" class="logout-icon"/>
    </a>
  </div>

  <div class="greetings">
    <a href="/profile" class="logout-style" @click.prevent="profile">
      <img :src="avatarSrc" class="avatar" style="transform: scaleX(-1);" alt="none">
      <span1 class="user-name">{{ username }}</span1>
    </a>
  </div>

  <div v-if="showNotificationCreate" class="notification-create">
    {{ notificationTextCreate }}
  </div>
  <div v-if="showErrorCreate" class="notification-wrong-create">
    {{ errorMessageCreate }}
  </div>

  <div v-if="showNotificationChange" class="notification-change">
    {{ notificationTextChange }}
  </div>
  <div v-if="showErrorChange" class="notification-wrong-change">
    {{ errorMessageChange }}
  </div>

  <div class="page-wrapper">
    <span id="cart-sign">Создать товар</span>

    <div class="form-container">
      <form class="product-form" @submit.prevent="submitProduct">
        <div class="form-group">
          <img src="/images/interface/eye.png" alt="Выйти из аккаунта" class="eye-1"/>
          <label>Название товара</label>
          <input type="text" id="name" placeholder="Введите название" v-model="product.name">

          <label id="price">Цена товара</label>
          <input type="text" placeholder="Введите цену" v-model="product.price">

          <label id="price">Категория</label>
          <select id="category" v-model="product.category_id">

            <option disabled value=""></option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>

          <label for="image" id="price">Изображение товара (.png формат)</label>
          <input type="file" ref="imageInput" id="image" @change="handleImageUpload">

          <button type="submit" id="accept">Добавить</button>
        </div>
      </form>

      <span id="cart-change">Изменить товар</span>
      <form class="product-form-change" @submit.prevent="changeProduct">
        <img src="/images/interface/eye.png" alt="Выйти из аккаунта" class="eye-2"/>
        <div class="form-group">
          <label id="price">Название товара</label>
          <select id="goods" v-model="selectedGoodId">
            <option disabled value=""></option>
            <option v-for="good in goods" :key="good.id" :value="good.id">
              {{ good.name }}
            </option>
          </select>

          <label id="price">Категория</label>
          <select id="category" v-model="productToChange.category_id" @change="selectCategory">
            <option disabled value=""></option>
            <option v-for="category in categoriesToChange" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>

          <div class="input-row">
            <div class="input-group">
              <label>Новое название</label>
              <input type="text" placeholder="Введите название" v-model="productToChange.name">
            </div>

            <div class="input-group">
              <label>Новая цена</label>
              <input type="text" placeholder="Введите цену" v-model="productToChange.price">
            </div>
          </div>

          <label for="image" id="price">Изображение товара (.png формат)</label>
          <input type="file" ref="imageInputChange" id="imageChange" @change="handleImageUploadChange">

          <button type="submit" id="accept">Изменить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  position: relative;
}

.input-row {
  display: flex;
  gap: 20px;
  margin-top: 40px;
}

.input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.input-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

.form-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;
  flex-wrap: wrap;
}

#cart-sign {
  margin-left: 355px;
  margin-top: 60px;
}

#cart-change {
  margin-left: 315px;
  margin-top: -366px;
}

.product-form {
  margin-top: -60px;
  width: 100%;
  max-width: 500px;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.product-form-change {
  width: 100%;
  max-width: 500px;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #f9f9f9;
  margin-top: 185px;
}

#price {
  margin-top: 15px;
}

#accept {
  width: 30%;
  margin-top: 25px;
  margin-left: 347px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

input,
textarea,
select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  display: inline-block;
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
  background-color: #f3f5f6;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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

.notification-create {
  position: absolute;
  top: 63.5%;
  left: 31.2%;
  transform: translate(-50%, -50%);
  max-width: 240px;
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

.notification-wrong-create {
  position: absolute;
  top: 63.5%;
  left: 31.1%;
  transform: translate(-50%, -50%);
  max-width: 240px;
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

.notification-change {
  position: absolute;
  top: 78.5%;
  left: 63.3%;
  transform: translate(-50%, -50%);
  max-width: 240px;
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

.notification-wrong-change {
  position: absolute;
  top: 78.3%;
  left: 63.3%;
  transform: translate(-50%, -50%);
  max-width: 240px;
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

.eye-1 {
  margin-left: -12px;
  margin-top: 340px;
  width: 55px;
  height: 55px;
  transition: transform 0.3s ease, filter 0.3s ease;
  object-fit: contain;
  position: absolute;
}

.eye-2 {
  margin-left: -10px;
  margin-top: 380px;
  width: 55px;
  height: 55px;
  transition: transform 0.3s ease, filter 0.3s ease;
  object-fit: contain;
  position: absolute;
}

</style>
