import axios from 'axios';
const URL = 'http://laravelshop.loc/api/comments';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? {Authorization: `Bearer ${token}`} : {};
}

export async function fetchComments(params = {}) {
    const response = await axios.get(URL, {
        params,
        headers: getAuthHeaders()
    });
    return response.data;
}

export async function createComment(data) {
    const response = await axios.post(URL, data, {
        headers: getAuthHeaders()
    });
    return response.data;
}

export async function deleteComment(comment) {
    const response = await axios.delete(`${URL}/${comment}`, {
        headers: getAuthHeaders()
    });
    return response.data;
}

