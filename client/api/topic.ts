import client from './client';

/**
 * Create a topic under a subject
 */
export const createTopic = async (data: {
  subject: string;
  name: string;
  estimatedMinutes: number;
  difficultyScore?: number;
}) => {
  try {
    const response = await client.post('/topic/create', data);
    return response.data.topic;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to create topic';
  }
};

/**
 * Get topics for a subject
 */
export const getTopicsBySubject = async (subjectId: string) => {
  try {
    const response = await client.get(`/topic/bySubject/${subjectId}`);
    return response.data.topics;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to fetch topics';
  }
};

/**
 * Update a topic
 */
export const updateTopic = async (
  topicId: string,
  data: {
    name?: string;
    estimatedMinutes?: number;
    difficultyScore?: number;
    masteryLevel?: number;
    status?: 'pending' | 'active' | 'completed';
  }
) => {
  try {
    const response = await client.put(`/topic/update/${topicId}`, data);
    return response.data.topic;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to update topic';
  }
};

/**
 * Delete a topic
 */
export const deleteTopic = async (topicId: string) => {
  try {
    const response = await client.delete(`/topic/delete/${topicId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to delete topic';
  }
};
