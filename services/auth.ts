import api from './api';

export const authService = {
    register: async (data: any) => {
        const response = await api.post('/api/register/', data);
        return response.data;
    },
    login: async (data: any) => {
        const response = await api.post('/api/token/', data);
        return response.data;
    },
    refreshToken: async (refresh: string) => {
        const response = await api.post('/api/token/refresh/', { refresh });
        return response.data;
    }
};
