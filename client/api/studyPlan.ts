import client from './client';

export const getTodayPlan = async () => {
    try {
        const response = await client.get('/study-plan/today');
        return response.data.plan;
    } catch (error: any) {
        // 404 means no plan for today, which might be valid UI state (empty)
        if (error.response?.status === 404) {
            return null;
        }
        throw error.response?.data?.message || 'Failed to fetch today\'s plan';
    }
};

export const getPlanByDate = async (date: string) => {
    try {
        const response = await client.get('/study-plan', { params: { date } });
        return response.data.plan;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        throw error.response?.data?.message || 'Failed to fetch plan for date';
    }
};

export const regeneratePlan = async () => {
    try {
        const response = await client.post('/study-plan/regenerate');
        return response.data.plan;
    } catch (error: any) {
        throw error.response?.data?.message || 'Failed to regenerate plan';
    }
};
