import { useQuery } from '@tanstack/react-query';
import { trainingsService } from '@/services/trainings';

export const TRAINING_KEYS = {
    all: ['trainings'] as const,
    lists: () => [...TRAINING_KEYS.all, 'list'] as const,
    list: (query: string) => [...TRAINING_KEYS.lists(), { query }] as const,
    details: () => [...TRAINING_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...TRAINING_KEYS.details(), id] as const,
    categories: ['training-categories'] as const,
    recommendations: ['training-recommendations'] as const,
};

export function useTrainingPlans(query: string = '') {
    return useQuery({
        queryKey: TRAINING_KEYS.list(query),
        queryFn: () => trainingsService.searchTrainingPlans(query),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}

export function useTrainingPlan(id: number) {
    return useQuery({
        queryKey: TRAINING_KEYS.detail(id),
        queryFn: () => trainingsService.getTrainingPlans(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}

export function useTrainingCategories() {
    return useQuery({
        queryKey: TRAINING_KEYS.categories,
        queryFn: trainingsService.getTrainingCategories,
        staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
}

export function useTrainingRecommendations() {
    return useQuery({
        queryKey: TRAINING_KEYS.recommendations,
        queryFn: trainingsService.getRecommendations,
        staleTime: 1000 * 60 * 15, // 15 minutes (more dynamic)
    });
}
