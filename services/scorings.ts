import api from './api';

export const scoringsService = {
    getScorings: async (type?: 'current' | 'top' | 'leaderboard' | 'levels', id?: number, timeFrame?: 'daily' | 'weekly' | 'monthly') => {
        const response = await api.get('/scoring-get', { params: { type, id, time_frame: timeFrame } });
        return response.data;
    },
    getLevel: async () => {
        const response = await api.get('/scoring-level');
        return response.data;
    },
};
