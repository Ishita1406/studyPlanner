import client from './client';

export const logSession = async (sessionData: {
    topicId: string;
    durationMinutes: number;
    difficultyRating: number;
    focusRating: number;
    notes?: string;
}) => {
    try {
        const response = await client.post('/sessions', sessionData);
        return response.data;
    } catch (error: any) {
        throw error.response?.data?.message || 'Failed to log session';
    }
};

export const getSessions = async () => {
    try {
        const response = await client.get('/sessions');
        return response.data.sessions;
    } catch (error: any) {
        throw error.response?.data?.message || 'Failed to fetch sessions';
    }
};
