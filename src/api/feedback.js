import axios from 'axios';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? {Authorization: `Bearer ${token}`} : {};
}
export async function sendFeedback({ name, subject, message, email }) {
    const response = await axios.post(
        'http://laravelshop.loc/api/feedback',
        { name, subject, message, email },
        { headers: getAuthHeaders() }
    );
    return response.data;
}