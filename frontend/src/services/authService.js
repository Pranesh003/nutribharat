import api from './api';

const authService = {
    login: async (email, password) => {
        const data = await api.post('/auth/login', { email, password });
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    register: async (name, email, password) => {
        return api.post('/auth/register', { name, email, password });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userProfile'); // Clear legacy local storage if exists
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    fetchProfile: async () => {
        return api.get('/user');
    },

    updateProfile: async (profileData) => {
        return api.put('/user', { profile: profileData });
    },

    generatePlan: async () => {
        return api.post('/plan/generate');
    }
};

export default authService;
