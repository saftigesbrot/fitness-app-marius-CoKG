import api from './api';

export const exercisesService = {
    createExercise: async (formData: FormData) => {
        const response = await api.post('/exercise-create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            transformRequest: (data) => {
                return data; // Prevent Axios from stringifying the FormData
            },
        });
        return response.data;
    },
    getExercise: async (id: number) => {
        const response = await api.get('/exercise-get', { params: { id } });
        return response.data;
    },
    searchExercises: async (name?: string, category?: string) => {
        const response = await api.get('/exercise-search', { params: { name, category } });
        return response.data;
    },
    getCategories: async () => {
        const response = await api.get('/category-list');
        return response.data;
    },
    updateExercise: async (id: number, formData: FormData) => {
        const response = await api.put(`/exercise-update?id=${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            transformRequest: (data) => data,
        });
        return response.data;
    },
    deleteExercise: async (id: number) => {
        const response = await api.delete(`/exercise-delete?id=${id}`);
        return response.data;
    },
};
