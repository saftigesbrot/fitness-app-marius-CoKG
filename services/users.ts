import api from './api';

export const usersService = {
    getUser: async (id: number) => {
        const response = await api.get('/user-get', { params: { id } });
        return response.data;
    },
};
