import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
export const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
    async (config) => {
        let token = null;
        if (Platform.OS === 'web') {
            token = localStorage.getItem('access_token');
        } else {
            token = await SecureStore.getItemAsync('access_token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // If data is FormData, let the browser set Content-Type (with boundary)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Get refresh token
                let refreshToken = null;
                if (Platform.OS === 'web') {
                    refreshToken = localStorage.getItem('refresh_token');
                } else {
                    refreshToken = await SecureStore.getItemAsync('refresh_token');
                }

                if (refreshToken) {
                    // Call refresh endpoint directly (bypassing this interceptor)
                    // We use axios.create() to get a fresh instance without interceptors for this call
                    const response = await axios.post(`${API_URL}/api/token/refresh/`, {
                        refresh: refreshToken
                    });

                    const newAccessToken = response.data.access;

                    // Save new token
                    if (Platform.OS === 'web') {
                        localStorage.setItem('access_token', newAccessToken);
                    } else {
                        await SecureStore.setItemAsync('access_token', newAccessToken);
                    }

                    // Update header and retry
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Return the original error if refresh fails (which will trigger logout logic usually)
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
