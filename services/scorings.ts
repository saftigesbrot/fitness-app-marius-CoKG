import api from './api';

export const scoringsService = {
    getScorings: async (type?: 'current' | 'top', id?: number) => {
        const response = await api.get('/scoring-get', { params: { type, id } });
        return response.data;
    },
    getLevel: async () => {
        const response = await api.get('/scoring-level');
        return response.data;
    },
};
