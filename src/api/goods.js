import axios from 'axios';

export async function fetchGoods(categoryId) {
    const response = await axios.get(`http://laravelshop.loc/api/goods/${categoryId}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? {Authorization: `Bearer ${token}`} : {};
}

export async function fetchCartPage(page = 1, userId = null) {
    const id = userId || localStorage.getItem('user_id');
    const response = await axios.get(`http://laravelshop.loc/api/cartPage/${id}?page=${page}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
}
export async function removeFromCart(product_id) {
    const response = await axios.delete(`http://laravelshop.loc/api/cart/${product_id}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
}

export function addToCart(productId) {
    return axios.post(
        'http://laravelshop.loc/api/cart',
        {product_id: productId},
        {headers: getAuthHeaders()}
    ).then(response => response.data);
}

export async function create(formData) {
    const response = await axios.post('http://laravelshop.loc/api/create', formData, {
        headers: getAuthHeaders()
    });
    return response.data;
}

export async function change(id, formData) {
    formData.append('_method', 'PUT');

    const response = await axios.post(`http://laravelshop.loc/api/change/${id}`, formData, {
        headers: getAuthHeaders(),
    });
    return response.data;
}

export async function clearAll() {
    const response = await axios.post(
        `http://laravelshop.loc/api/cart/clear`,
        {},
        {
            headers: getAuthHeaders(),
        }
    );
    return response.data;
}

export async function loadUserCart(userId, page = 1) {
    const token = localStorage.getItem('token');

    const response = await fetch(`http://laravelshop.loc/api/cart/${userId}?page=${page}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        },
    });

    const data = await response.json();
    if (response.ok) {
        return {
            success: true,
            user: data.user,
            comments: data.comments,
            goods: data.goods,
        };
    } else {
        return {
            success: false,
            message: data.message || 'Ошибка при загрузке данных пользователя',
        };
    }
}
