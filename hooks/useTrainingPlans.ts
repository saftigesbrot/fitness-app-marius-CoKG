import { useQuery, useQueryClient } from '@tanstack/react-query';
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
        queryKey: query ? TRAINING_KEYS.list(query) : TRAINING_KEYS.lists(),
        queryFn: () => query ? trainingsService.searchTrainingPlans(query) : trainingsService.getTrainingPlans(),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}

export function useTrainingPlan(id: number) {
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: TRAINING_KEYS.detail(id),
        queryFn: () => trainingsService.getTrainingPlans(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        initialData: () => {
            const listData = queryClient.getQueryData<any[]>(TRAINING_KEYS.lists());
            return listData?.find(plan => (plan.plan_id === id || plan.id === id));
        },
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
