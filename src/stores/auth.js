import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const token = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  // Actions
  const login = async (credentials) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authAPI.login(credentials);
      const { user: userData, token: authToken } = response.data.data;

      // Save to state and localStorage
      user.value = userData;
      token.value = authToken;
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authAPI.register(userData);
      const { user: newUser, token: authToken } = response.data.data;

      // Save to state and localStorage
      user.value = newUser;
      token.value = authToken;
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const setUser = (userData) => {
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const initAuth = async () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);

      // Verify token is still valid
      try {
        const response = await authAPI.getCurrentUser();
        user.value = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(user.value));
      } catch (err) {
        // Token invalid, clear auth state
        logout();
      }
    }
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    setUser,
    initAuth
  };
});
