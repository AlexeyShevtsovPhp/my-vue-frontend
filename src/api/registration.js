export async function registration(name, password) {
    const data = { name, password };

    const response = await fetch('http://laravelshop.loc/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });


    const result = await response.json();

    if (response.ok) {
        return { success: true, data: result };
    } else {
        return { success: false, errors: result.errors || {}, message: result.message || 'Ошибка регистрации' };
    }
}
