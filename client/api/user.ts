import client from './client';

export const createProfile = async (data: any) => {
    try {
        const response = await client.post('/profile/create', data);
        return response.data.user;
    } catch (error: any) {
        throw error.response?.data?.message || 'Failed to create profile';
    }
};

export const getProfile = async () => {
    try {
        const response = await client.get('/profile/getProfile');
        return response.data.user;
    } catch (error: any) {
        throw error.response?.data?.message || 'Failed to fetch profile';
    }
};

export const updateProfile = async (data: any) => {
    try {
        const response = await client.put('/profile/updateProfile', data);
        return response.data.user;
    } catch (error: any) {
        throw error.response?.data?.message || 'Failed to update profile';
    }
};
