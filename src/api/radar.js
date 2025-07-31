export async function searchAddresses(query) {
    const response = await fetch(`http://laravelshop.loc/api/search?query=${encodeURIComponent(query)}`,
        {
            cache: 'no-store'
        });
    if (!response.ok) {
        console.error('Ошибка запроса:', response.status);
        return [];
    }
    const data = await response.json();
    return data.addresses;
}



