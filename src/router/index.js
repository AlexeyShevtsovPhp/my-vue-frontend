import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Registration from '../components/Registration.vue'
import Categories from '../components/Categories.vue'
import Profile from "../components/Profile.vue";
import Cart from "../components/Cart.vue";
import UserList from "../components/UserList.vue";
import CreateGood from "../components/CreateGood.vue";
import Email from "../components/Email.vue";
import ItemPage from "../components/ItemPage.vue";

const routes = [
    { path: '/login', component: Login },
    { path: '/registration', component: Registration },
    {
        path: '/categories',
        component: Categories,
        meta: { requiresAuth: true,
        title: 'Категории'}
    },
    {
        path: '/profile',
        component: Profile,
        meta: { requiresAuth: true,
            title: 'Профиль'}
    },
    {
        path: '/cart',
        component: Cart,
        meta: { requiresAuth: true,
            title: 'Корзина'}
    },
    {
        path: '/users',
        component: UserList,
        meta: { requiresAuth: true, requiresAdmin: true, title: 'Список пользователей' }
    },
    {
        path: '/create',
        component: CreateGood,
        meta: { requiresAuth: true, requiresAdmin: true, title: 'Создать товар' }
    },

    {
        path: '/detail/:id',
        name: 'GoodDetail',
        component: ItemPage,
        meta: { requiresAuth: true, title: 'Товар' }
    },

    {
        path: '/users/:id',
        name: 'UserProfile',
        component: UserList,
    },

    {
        path: '/email',
        component: Email,
        meta: { requiresAuth: true, title: 'Почта' }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (to.meta.requiresAuth && !token) {
        next('/login');
    } else if (to.meta.requiresAdmin && role !== 'admin') {
        next('/categories');
    } else {
        next();
    }
})
router.afterEach((to) => {
    const defaultTitle = 'LaravelShop';
    document.title = to.meta.title || defaultTitle;
});
export default router