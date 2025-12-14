import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
const API_URL = 'http://127.0.0.1:8000';

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
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling token refresh (basic implementation)
// For now we just reject if 401, but in a full app we'd try to refresh.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // const originalRequest = error.config;
        // if (error.response.status === 401 && !originalRequest._retry) {
        //   // TODO: Implement refresh token logic
        // }
        return Promise.reject(error);
    }
);

export default api;
