import api from './api';

export const exercisesService = {
    createExercise: async (formData: FormData) => {
        const response = await api.post('/exercise-create', formData, {
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
};
