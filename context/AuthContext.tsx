import React, { createContext, useContext } from 'react';
import { useStorageState } from '../hooks/useStorageState';

interface AuthContextType {
    signIn: (token: string, refreshToken: string, username: string) => void;
    signInAsGuest: () => void;
    signOut: () => void;
    session?: string | null;
    isGuest?: boolean;
    username?: string | null;
    isLoading: boolean;
    guestDifficulty: string;
    setGuestDifficulty: (level: string) => void;
}

const AuthContext = createContext<AuthContextType>({
    signIn: () => null,
    signInAsGuest: () => null,
    signOut: () => null,
    session: null,
    isGuest: false,
    username: null,
    isLoading: false,
    guestDifficulty: 'mittel',
    setGuestDifficulty: () => null,
});

export function useSession() {
    const value = useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }
    return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('access_token');
    const [[, refreshToken], setRefreshToken] = useStorageState('refresh_token');
    const [[, username], setUsername] = useStorageState('username');
    const [[isGuestLoading, isGuestRaw], setGuest] = useStorageState('is_guest');
    const [[difficultyLoading, difficultyRaw], setDifficulty] = useStorageState('guest_difficulty');

    const isGuest = isGuestRaw === 'true';
    const guestDifficulty = difficultyRaw || 'mittel';

    const signIn = (accessToken: string, newRefreshToken: string, user: string) => {
        setSession(accessToken);
        setRefreshToken(newRefreshToken);
        setUsername(user);
        setGuest(null);
    };

    const signInAsGuest = () => {
        setGuest('true');
        if (!difficultyRaw) {
            setDifficulty('mittel');
        }
    };

    const signOut = () => {
        setSession(null);
        setRefreshToken(null);
        setUsername(null);
        setGuest(null);
        setDifficulty(null);
    };

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signInAsGuest,
                signOut,
                session,
                isGuest,
                isLoading: isLoading || isGuestLoading || difficultyLoading,
                username,
                guestDifficulty,
                setGuestDifficulty: setDifficulty,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}
