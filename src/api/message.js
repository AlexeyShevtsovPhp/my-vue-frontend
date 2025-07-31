import axios from 'axios';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? {Authorization: `Bearer ${token}`} : {};
}

export async function sendMessage(message) {
    const response = await axios.post(
        'http://laravelshop.loc/api/send-message',
        {message},
        { headers: getAuthHeaders() }
    );
    return response.data;
}