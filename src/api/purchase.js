import axios from 'axios';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? {Authorization: `Bearer ${token}`} : {};
}
export async function buy() {
    const response = await axios.post(
        'http://laravelshop.loc/api/buy',
        {},
        { headers: getAuthHeaders() }
    );
    return response.data;
}