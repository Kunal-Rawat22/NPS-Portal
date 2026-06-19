import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, AuthResponse } from '../types';
import { resetSessionExpiredFlag } from '../utils/sessionExpired';

const loadFromStorage = (): AuthState => {
  try {
    const token = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      return { accessToken: token, refreshToken: refresh, user: JSON.parse(user), isAuthenticated: true };
    }
  } catch {}
  return { user: null, accessToken: null, refreshToken: null, isAuthenticated: false };
};

const initialState: AuthState = loadFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      resetSessionExpiredFlag();
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
