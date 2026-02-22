import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { exercisesService } from '@/services/exercises';
import { trainingsService } from '@/services/trainings';
import { Alert } from 'react-native';

const QUEUE_KEY = 'mutation_queue';

type MutationType = 'CREATE_EXERCISE' | 'SAVE_TRAINING_SESSION' | 'CREATE_TRAINING_PLAN';

interface MutationAction {
    id: string;
    type: MutationType;
    payload: any;
    timestamp: number;
}

interface OfflineMutationContextType {
    queue: MutationAction[];
    addToQueue: (type: MutationType, payload: any) => void;
    syncQueue: () => Promise<void>;
    isOnline: boolean;
}

const OfflineMutationContext = createContext<OfflineMutationContextType>({
    queue: [],
    addToQueue: () => { },
    syncQueue: async () => { },
    isOnline: true,
});

export const useOfflineMutation = () => useContext(OfflineMutationContext);

export const OfflineMutationProvider = ({ children }: { children: React.ReactNode }) => {
    const [queue, setQueue] = useState<MutationAction[]>([]);
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        loadQueue();

        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const online = state.isConnected === true && state.isInternetReachable !== false;
            setIsOnline(online);
            if (online) {
                syncQueue();
            }
        });

        return () => unsubscribe();
    }, []);

    const loadQueue = async () => {
        try {
            const storedQueue = await AsyncStorage.getItem(QUEUE_KEY);
            if (storedQueue) {
                setQueue(JSON.parse(storedQueue));
            }
        } catch (e) {
            console.error('Failed to parse offline queue', e);
        }
    };

    const saveQueue = async (newQueue: MutationAction[]) => {
        setQueue(newQueue);
        try {
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
        } catch (e) {
            console.error('Failed to save queue', e);
        }
    };

    const addToQueue = (type: MutationType, payload: any) => {
        const action: MutationAction = {
            id: Date.now().toString() + Math.random().toString(),
            type,
            payload,
            timestamp: Date.now(),
        };
        const newQueue = [...queue, action];
        saveQueue(newQueue);
        Alert.alert('Offline', 'Aktion wurde lokal gespeichert und wird gesendet, sobald du wieder online bist.');
    };

    const processAction = async (action: MutationAction) => {
        switch (action.type) {
            case 'CREATE_EXERCISE': {
                const formData = new FormData();
                formData.append('name', action.payload.name);
                formData.append('description', action.payload.description);
                formData.append('category', String(action.payload.category));
                formData.append('public', String(action.payload.public));

                if (action.payload.imageUri) {
                    const filename = action.payload.imageUri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image`;
                    // @ts-ignore
                    formData.append('image', { uri: action.payload.imageUri, name: filename, type });
                }
                await exercisesService.createExercise(formData);
                break;
            }
            case 'CREATE_TRAINING_PLAN':
                await trainingsService.createTrainingPlan(action.payload);
                break;
            case 'SAVE_TRAINING_SESSION':
                await trainingsService.saveTrainingSession(action.payload);
                break;
            default:
                console.warn('Unknown mutation type:', action.type);
        }
    };

    const syncQueue = async () => {
        if (isSyncing) return;

        // We need to read the latest queue from state. 
        // However, in a closure, 'queue' might be stale if not careful.
        // It's safer to read from AsyncStorage or use functional updates, 
        // but 'processAction' takes time.
        // Let's rely on the queue state but ensure we don't double-process.

        if (queue.length === 0) return;

        setIsSyncing(true);

        const currentQueue = [...queue];
        const failedActions: MutationAction[] = [];

        for (const action of currentQueue) {
            try {
                await processAction(action);
            } catch (error) {
                console.error(`Failed to sync action ${action.type}:`, error);
                failedActions.push(action);
            }
        }

        if (failedActions.length < currentQueue.length) {
            Alert.alert('Sync', `${currentQueue.length - failedActions.length} Aktionen wurden synchronisiert.`);
        }

        await saveQueue(failedActions);
        setIsSyncing(false);
    };

    return (
        <OfflineMutationContext.Provider value={{ queue, addToQueue, syncQueue, isOnline }}>
            {children}
        </OfflineMutationContext.Provider>
    );
};
