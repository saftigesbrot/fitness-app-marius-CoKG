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
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/sign-in');
    } else if (session && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/');
    }
  }, [session, segments, isLoading]);

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
import { OfflineMutationProvider, useOfflineMutation } from '@/context/OfflineMutationContext';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useQueryClient } from '@tanstack/react-query';
import { USER_KEYS } from '@/hooks/useProfile';
import { TRAINING_KEYS } from '@/hooks/useTrainingPlans';
import { usersService } from '@/services/users';
import { scoringsService } from '@/services/scorings';
import { trainingsService } from '@/services/trainings';
import { exercisesService } from '@/services/exercises';
import { EXERCISE_KEYS } from '@/hooks/useExercises';

function DataPrefetcher() {
  const { session } = useSession();
  const { isOnline } = useOfflineMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (session && isOnline) {
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
  }, [session, isOnline, queryClient]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <OfflineMutationProvider>
        <SessionProvider>
          <DataPrefetcher />
          <OfflineIndicator />
          <RootLayoutNav />
        </SessionProvider>
      </OfflineMutationProvider>
    </QueryProvider>
  );
}
