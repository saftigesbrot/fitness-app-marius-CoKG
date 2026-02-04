import api from './api';

export const trainingsService = {
    createTrainingPlan: async (data: any) => {
        const response = await api.post('/training-create', data);
        return response.data;
    },
    getTrainingPlans: async (id?: number) => {
        const response = await api.get('/training-get', { params: { id } });
        return response.data;
    },
    searchTrainingPlans: async (query: string) => {
        const response = await api.get('/training-search', { params: { q: query } });
        return response.data;
    },
    getTrainingCategories: async () => {
        const response = await api.get('/training-categories');
        return response.data;
    },
    editTrainingPlan: async (data: any) => {
        const response = await api.put('/training-edit', data);
        return response.data;
    },
    startTraining: async (plan_id: number) => {
        const response = await api.post('/training-start', { plan_id });
        return response.data;
    },
    saveTraining: async (data: any) => {
        const response = await api.post('/training-save', data);
        return response.data;
    },
    saveTrainingSession: async (data: { plan_id: number; exercises_order: number[]; sets: any[] }) => {
        const response = await api.post('/training-save', data);
        return response.data;
    },
    getLastExecutedPlan: async () => {
        const response = await api.get('/training-last-executed');
        return response.data;
    },
};
