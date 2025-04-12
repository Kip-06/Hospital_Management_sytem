import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of a user
interface User {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: 'patient' | 'doctor' | 'admin' | null;
  specialization?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define the shape of the authentication state
export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// Initial state for the auth slice
const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false
};

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to set user credentials
    setUser: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    // Action to update user data only
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = { ...state.user, ...action.payload };
    },
    // Action to clear user credentials (logout)
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    }
  }
});

// Export actions and reducer
export const { setUser, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

// Selector to check if user is authenticated
export const selectIsAuthenticated = (state: { auth: AuthState }) => 
  state.auth.isAuthenticated;

// Selector to get current user role
export const selectUserRole = (state: { auth: AuthState }) => 
  state.auth.user?.role || null;

// Selector to get full user object
export const selectUser = (state: { auth: AuthState }) => 
  state.auth.user;