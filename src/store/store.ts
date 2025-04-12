import { configureStore, combineReducers, Reducer } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from '../store/slices/authSlice';
import { authApi } from "./api/authApi";
import { appointmentApi } from "./api/appointmentApi";
import { departmentApi } from "./api/departmentsApi";
import { doctorApi } from "./api/doctorsApi";
import { reportsApi } from "./api/reportsApi";
import { usersApi } from "./api/userManagementApi";
import { dashboardApi } from "./api/dashboardApi";
import { calendarApi } from "./api/calendarApi";
import { updatesApi } from "./api/updatesApi";
import { activitiesApi } from "./api/activitiesApi";
import { settingsApi } from "./api/SettingsApi";
import { analyticsApi } from "./api/analyticsApi";
import { patientsApi } from "./api/patientsApi";
import { medicalRecordsApi } from "./api/medicalRecordsApi";
import { prescriptionApi } from "./api/prescriptionsApi";
import { billingApi } from "./api/billingApi";


const persistConfig = {
    key: 'root',
    storage,
};

const rootReducer: Reducer = combineReducers({
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [appointmentApi.reducerPath]: appointmentApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [calendarApi.reducerPath]: calendarApi.reducer,
    [updatesApi.reducerPath]: updatesApi.reducer,
    [activitiesApi.reducerPath]: activitiesApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [patientsApi.reducerPath]: patientsApi.reducer,
    [medicalRecordsApi.reducerPath]: medicalRecordsApi.reducer,
    [prescriptionApi.reducerPath]: prescriptionApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
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
            appointmentApi.middleware,
            departmentApi.middleware,
            doctorApi.middleware,
            reportsApi.middleware,
            usersApi.middleware,
            dashboardApi.middleware,
            calendarApi.middleware,
            updatesApi.middleware,
            activitiesApi.middleware,
            settingsApi.middleware,
            analyticsApi.middleware,
            patientsApi.middleware,
            medicalRecordsApi.middleware,
            prescriptionApi.middleware,
            billingApi.middleware,
        ),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);