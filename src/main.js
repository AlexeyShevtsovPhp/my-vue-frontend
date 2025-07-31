import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import channel from './plugins/pusher';
import { echo } from './plugins/echo.js';



const app = createApp(App)
app.use(router)
app.mount('#app')
