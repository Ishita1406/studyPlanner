import client from './client';
import { setItem, getItem, deleteItem } from './storage';

export const login = async (email: string, password: string) => {
    try {
        console.log("Sending login request to:", '/auth/login');
        const response = await client.post('/auth/login', { email, password });
        console.log("Login response received:", response.status);
        const { accessToken } = response.data;

        await setItem('token', accessToken);

        // Fetch user details
        console.log("Fetching user details...");
        const userResponse = await client.get('/auth/get');
        const user = userResponse.data.user;

        await setItem('user', JSON.stringify(user));

        return user;
    } catch (error: any) {
        console.error("Auth service error:", error);
        throw error.response?.data?.message || 'Login failed';
    }
};

export const register = async (name: string, email: string, password: string) => {
    try {
        console.log("Sending register request to:", '/auth/register');
        const response = await client.post('/auth/register', { name, email, password });
        console.log("Register response received:", response.status);
        return response.data;
    } catch (error: any) {
        console.error("Auth service error (register):", error);
        throw error.response?.data?.message || 'Registration failed';
    }
};

export const logout = async () => {
    await deleteItem('token');
    await deleteItem('user');
};

export const getToken = async () => {
    return await getItem('token');
};

export const getUser = async () => {
    const user = await getItem('user');
    return user ? JSON.parse(user) : null;
};
