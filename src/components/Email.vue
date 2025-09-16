<script>
import { sendFeedback } from "../api/feedback.js";
export default {
  data() {
    return {

      subject: '',
      message: '',

      username: localStorage.getItem('username') || 'Гость',
      role: localStorage.getItem('role') || null,
      email: localStorage.getItem('email'),

      showNotification: false,
      showError: false,
      notificationText: '',
      errorMessage: '',

      isLoading: false,

    }
  },
  methods: {
    goToCategories() {
      this.$router.push('/categories');
    },
    profile() {
      this.$router.push('/profile');
    },
    async submitFeedback() {
      if (this.subject.trim() && this.message.trim()) {
        this.isLoading = true;
      }
      try {
        await sendFeedback({
          name: this.username,
          email: this.email,
          subject: this.subject,
          message: this.message,
        });

        this.notificationText = 'Письмо уже было успешно отправлено';
        this.isLoading = false;
        this.showNotification = true;
        this.subject = '';
        this.message = '';
        setTimeout(() => {
          this.showNotification = false;
        }, 3000);
      } catch (error) {
        const errors = error.response.data.errors;
        if (errors) {
          this.errorMessage = Object.values(errors)[0][0];
        }
        this.isLoading = false;
        this.showError = true;
        setTimeout(() => {
          this.showError = false;
        }, 3000);
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
    <a href="/logout" class="logout-style" @click.prevent="goToCategories">
      <img src="/images/back.png" alt="Выйти из аккаунта" class="logout-icon"/>
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

  <div class ="email-labels">
  <label class="e-mail-info">Оставьте свой отзыв или задайте вопрос на интересующую вас тему.</label>
  <label class="e-mail-info">Наш ответ поступит вам на почту в течение 3 рабочих дней.</label>
  </div>

  <form class="feedBack-container" @submit.prevent="submitFeedback">
    <input type="hidden" id="name" name="name" value=""/>

    <p v-if="isLoading" class = "loading">
      Загрузка...
    </p>

    <div class="form-message">
      <input id="subject" placeholder="Введите тему сообщения" v-model="subject">
      <textarea id="message" placeholder="Введите ваш комментарий" v-model="message"></textarea>
    </div>
    <div class="form-submit">
      <button id="submit-button" type="submit">Отправить</button>
    </div>
  </form>

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

.loading{
  text-align: center;
  font-size: 1.8em;
  color: gray;
  position: absolute;
  margin-left: 829px;
  margin-top: 3px;
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

.email-labels {
  margin-top: 50px;
}

.e-mail-info {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  color: #333;
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 15px 25px;
  border-radius: 12px;
  display: block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  margin-left: 595px;
  max-width: 590px;
  width: 100%;
  z-index: 1000;
}

.feedBack-container {
  position: absolute;
  margin-top: 40px;
  margin-left: 20px;
  width: 15%;
  max-width: 900px;
  border-collapse: collapse;
  display: block;
}

input {
  margin-left: 575px;
  margin-top: 230px;
  width: 33.4%;
  height: 25px;
  position: absolute;
  padding: 8px;
  border: 2px solid #741faa;
  border-radius: 8px;
}

.form-submit {
  margin-left: 1071px;
  margin-top: 15px;
  display: block;
  transition: 0.5s;
}

#subject {
  display: block;
  width: 622px;
  margin-top: 65px;
}

textarea {
  width: 230%;
  height: 300px;
  padding: 8px;
  border: 2px solid #741faa;
  border-radius: 8px;
  box-sizing: border-box;
  margin-left: 575px;
  margin-top: 135px;
  resize: none;
}

button {
  font-family: 'Roboto', sans-serif;
  padding: 8px 24px;
  font-size: 1.2em;
  font-weight: 300;
  cursor: pointer;
  background-color: #ffffff;
  color: #454242;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  height: 45px;
  display: inline-block;
}

button:hover {
  transform: scale(1.05);
  background-color: #e6dbfb;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
