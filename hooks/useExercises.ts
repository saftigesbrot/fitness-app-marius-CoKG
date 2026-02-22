import { useQuery } from '@tanstack/react-query';
import { exercisesService } from '@/services/exercises';

export const EXERCISE_KEYS = {
    all: ['exercises'] as const,
    lists: () => [...EXERCISE_KEYS.all, 'list'] as const,
    list: (filters: string) => [...EXERCISE_KEYS.lists(), { filters }] as const,
    details: () => [...EXERCISE_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...EXERCISE_KEYS.details(), id] as const,
    categories: ['categories'] as const,
};

export function useExercises(search?: string, category?: string) {
    return useQuery({
        queryKey: EXERCISE_KEYS.list(JSON.stringify({ search, category })),
        queryFn: () => exercisesService.searchExercises(search, category),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}

export function useExercise(id: number) {
    return useQuery({
        queryKey: EXERCISE_KEYS.detail(id),
        queryFn: () => exercisesService.getExercise(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}

export function useExerciseCategories() {
    return useQuery({
        queryKey: EXERCISE_KEYS.categories,
        queryFn: exercisesService.getCategories,
        staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
}
