import { configureStore, combineReducers, Reducer } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from '../store/slices/authSlice';
import { authApi } from "./api/authApi";


const persistConfig = {
    key: 'root',
    storage,
};

const rootReducer: Reducer = combineReducers({
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
});


const persistedReducer = persistReducer(persistConfig, rootReducer);

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(
            authApi.middleware,
        ),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);