import client from './client';

export const createProfile = async (data: any) => {
  try {
    const response = await client.post('/profile/create', data);
    return response.data.profile;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to create profile';
  }
};

export const getProfile = async () => {
  try {
    const response = await client.get('/profile/getProfile');
    return response.data.profile;
  } catch (error: any) {
    // Important: propagate 404 so frontend knows profile does not exist
    throw error.response || error;
  }
};

export const updateProfile = async (data: any) => {
  try {
    const response = await client.put('/profile/updateProfile', data);
    return response.data.profile;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to update profile';
  }
};
