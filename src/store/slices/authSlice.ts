import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the authentication state
export interface AuthState {
  user: {
    token: string | null;
    role: 'patient' | 'doctor' | 'admin' | null;
  } | null;
}

// Initial state for the auth slice
const initialState: AuthState = {
  user: null
};

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to set user credentials
    setUser: (state, action: PayloadAction<{ token: string; role: 'patient' | 'doctor' | 'admin' }>) => {
      state.user = {
        token: action.payload.token,
        role: action.payload.role
      };
    },
    // Action to clear user credentials (logout)
    logout: (state) => {
      state.user = null;
    }
  }
});

// Export actions and reducer
export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;

// Selector to check if user is authenticated
export const selectIsAuthenticated = (state: { auth: AuthState }) => 
  state.auth.user !== null;

// Selector to get current user role
export const selectUserRole = (state: { auth: AuthState }) => 
  state.auth.user?.role || null;