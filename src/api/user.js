import axios from "axios";

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? {Authorization: `Bearer ${token}`} : {};
}

export async function login(name, password) {
    const data = {
        name: name,
        password: password,
    };

    const response = await fetch('http://laravelshop.loc/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(result);

    if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('username', result.user.name);
        localStorage.setItem('email', result.user.email);
        localStorage.setItem('role', result.user.role);
        localStorage.setItem('user_id', result.user.id.toString());

        return {success: true};
    } else {
        return {success: false, message: result.message || 'Неизвестная ошибка'};
    }
}

export async function loadAllUsers(page = 1) {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://laravelshop.loc/api/users?page=${page}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        return {success: false, message: errorData.message || 'Ошибка при загрузке пользователей'};
    }

    const data = await response.json();

    return {
        success: true,
        users: data.users,
        meta: data.meta,
    };
}
export async function loadUserInfo(userId) {
    const token = localStorage.getItem('token');

    const response = await fetch(`http://laravelshop.loc/api/users/${userId}`, {
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

export async function loadUserComments(userId, page = 1) {
    const token = localStorage.getItem('token');

    const response = await fetch(`http://laravelshop.loc/api/users/${userId}?page=${page}`, {
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

export async function deleteUser(user_id) {
    const response = await axios.delete(`http://laravelshop.loc/api/user/${user_id}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
}




