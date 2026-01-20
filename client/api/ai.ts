import axios from 'axios';
import API_URL from './config';

export const getTopicBreakdown = async (subject: string, context: string = '') => {
    try {
        const response = await axios.post(`${API_URL}/ai/breakdown`, {
            subject,
            context
        });
        return response.data.topics;
    } catch (error) {
        throw error;
    }
};

export const getSessionFeedback = async (sessionData: any) => {
    try {
        const response = await axios.post(`${API_URL}/ai/feedback`, {
            sessionData
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
