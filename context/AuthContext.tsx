import React, { createContext, useContext } from 'react';
import { useStorageState } from '../hooks/useStorageState';

interface AuthContextType {
    signIn: (token: string, refreshToken: string) => void;
    signOut: () => void;
    session?: string | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    signIn: () => null,
    signOut: () => null,
    session: null,
    isLoading: false,
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

    const signIn = (accessToken: string, newRefreshToken: string) => {
        setSession(accessToken);
        setRefreshToken(newRefreshToken);
    };

    const signOut = () => {
        setSession(null);
        setRefreshToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                session,
                isLoading,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}
