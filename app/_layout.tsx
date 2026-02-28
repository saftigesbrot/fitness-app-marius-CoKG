import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { SessionProvider, useSession } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isGuest, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !isGuest && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/sign-in');
    } else if ((session || isGuest) && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/');
    }
  }, [session, isGuest, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="exercise/create" options={{ title: 'Übung erstellen' }} />
        <Stack.Screen name="training/create" options={{ title: 'Neuer Plan' }} />
        <Stack.Screen name="training/[id]" options={{ title: 'Training' }} />
        <Stack.Screen name="training/edit/[id]" options={{ title: 'Plan Bearbeiten' }} />
        <Stack.Screen name="workout/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { QueryProvider } from '@/context/QueryContext';
import { useQueryClient } from '@tanstack/react-query';
import { USER_KEYS } from '@/hooks/useProfile';
import { TRAINING_KEYS } from '@/hooks/useTrainingPlans';
import { usersService } from '@/services/users';
import { scoringsService } from '@/services/scorings';
import { trainingsService } from '@/services/trainings';
import { exercisesService } from '@/services/exercises';
import { EXERCISE_KEYS } from '@/hooks/useExercises';
import { DUMMY_EXERCISE_CATEGORIES, DUMMY_PLAN_CATEGORIES, DUMMY_EXERCISES, DUMMY_RECOMMENDATIONS, DUMMY_TRAINING_PLANS } from '@/constants/guestData';

function DataPrefetcher() {
  const { session, isGuest } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isGuest) {
      console.log('Seeding guest data...');
      // Override default cache limits for guest so they don't expire quickly
      queryClient.setDefaultOptions({
        queries: {
          gcTime: Infinity,
          staleTime: Infinity,
        }
      });

      // Seed dummy exercises
      queryClient.setQueryData(
        EXERCISE_KEYS.list(JSON.stringify({ search: '', category: '' })),
        DUMMY_EXERCISES
      );
      queryClient.setQueryData(EXERCISE_KEYS.categories, DUMMY_EXERCISE_CATEGORIES);

      // Seed dummy training plans
      queryClient.setQueryData(TRAINING_KEYS.lists(), DUMMY_TRAINING_PLANS);
      queryClient.setQueryData(TRAINING_KEYS.recommendations, DUMMY_RECOMMENDATIONS);
      queryClient.setQueryData(TRAINING_KEYS.categories, DUMMY_PLAN_CATEGORIES);

      // We skip fetching the actual online data for guests
      return;
    }

    if (session && !isGuest) {
      console.log('Prefetching core data...');
      // Prefetch user profile/level/scoring
      queryClient.prefetchQuery({
        queryKey: USER_KEYS.level,
        queryFn: scoringsService.getLevel,
      });
      queryClient.prefetchQuery({
        queryKey: USER_KEYS.scoring('current'),
        queryFn: () => scoringsService.getScorings('current'),
      });
      queryClient.prefetchQuery({
        queryKey: USER_KEYS.scoring('leaderboard'),
        queryFn: () => scoringsService.getScorings('leaderboard'),
      });

      // Prefetch user's training plans and recommendations
      queryClient.prefetchQuery({
        queryKey: TRAINING_KEYS.lists(),
        queryFn: () => trainingsService.getTrainingPlans(),
      });
      queryClient.prefetchQuery({
        queryKey: TRAINING_KEYS.recommendations,
        queryFn: trainingsService.getRecommendations,
      });

      // Prefetch all exercises and categories for offline creation/editing
      queryClient.prefetchQuery({
        queryKey: EXERCISE_KEYS.list(JSON.stringify({ search: '', category: '' })),
        queryFn: () => exercisesService.searchExercises('', ''),
      });
      queryClient.prefetchQuery({
        queryKey: EXERCISE_KEYS.categories,
        queryFn: exercisesService.getCategories,
      });
    }
  }, [session, isGuest, queryClient]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <SessionProvider>
        <DataPrefetcher />
        <RootLayoutNav />
      </SessionProvider>
    </QueryProvider>
  );
}
