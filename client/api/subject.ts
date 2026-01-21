import client from './client';

/**
 * Create a new subject
 */
export const createSubject = async (data: {
  name: string;
  examDate?: string;
  importanceLevel?: number;
}) => {
  try {
    const response = await client.post('/subject/create', data);
    return response.data.subject;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to create subject';
  }
};

/**
 * Get all subjects for logged-in user
 */
export const getSubjects = async () => {
  try {
    const response = await client.get('/subject/getAll');
    return response.data.subjects;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to fetch subjects';
  }
};

/**
 * Update a subject
 */
export const updateSubject = async (
  subjectId: string,
  data: {
    name?: string;
    examDate?: string;
    importanceLevel?: number;
  }
) => {
  try {
    const response = await client.put(`/subject/update/${subjectId}`, data);
    return response.data.subject;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to update subject';
  }
};

/**
 * Delete a subject
 */
export const deleteSubject = async (subjectId: string) => {
  try {
    const response = await client.delete(`/subject/delete/${subjectId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to delete subject';
  }
};
