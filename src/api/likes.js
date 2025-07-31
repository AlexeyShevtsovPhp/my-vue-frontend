import axios from 'axios';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? {Authorization: `Bearer ${token}`} : {};
}

export async function toggleLike(good_id) {
    const response = await axios.post(`http://laravelshop.loc/api/goods/like/${good_id}`, {},
        {headers: getAuthHeaders()});

    return response.data;
}
