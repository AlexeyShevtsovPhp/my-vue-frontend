export async function getCategories() {
    const token = localStorage.getItem('token');
    if (!token) {
        return {success: false, message: 'Нет авторизации'};
    }

    const response = await fetch('http://laravelshop.loc/api/categories', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        },
        credentials: 'include'
    });

    const result = await response.json();

    if (response.ok) {
        return {success: true, data: result};
    } else {
        return {success: false, message: result.message || 'Ошибка получения категорий'};
    }
}