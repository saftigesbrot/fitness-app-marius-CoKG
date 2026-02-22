import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/users';
import { scoringsService } from '@/services/scorings';

export const USER_KEYS = {
    all: ['users'] as const,
    detail: (id: number) => [...USER_KEYS.all, 'detail', id] as const,
    level: ['user-level'] as const,
    scoring: (type: string) => ['user-scoring', type] as const,
};

export function useUser(id: number) {
    return useQuery({
        queryKey: USER_KEYS.detail(id),
        queryFn: () => usersService.getUser(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}

export function useUserLevel() {
    return useQuery({
        queryKey: USER_KEYS.level,
        queryFn: scoringsService.getLevel,
        staleTime: 1000 * 60 * 5,
    });
}

export function useScorings(type: 'current' | 'top' | 'leaderboard' | 'levels' = 'current', id?: number, timeFrame?: 'daily' | 'weekly' | 'monthly') {
    return useQuery({
        queryKey: USER_KEYS.scoring(type),
        queryFn: () => scoringsService.getScorings(type, id, timeFrame),
        staleTime: 1000 * 60 * 5,
    });
}
