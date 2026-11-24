import { getApp, getApps, initializeApp } from "firebase/app";
// @ts-ignore: getReactNativePersistence existe al ejecutar en React Native, aunque TypeScript no lo detecte
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Los valores salen del archivo .env (variables EXPO_PUBLIC_...)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// La sesión se guarda en el celular para no pedir el login cada vez
function crearAuth() {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Si ya estaba inicializado (por ejemplo al recargar la app), se reutiliza
    return getAuth(app);
  }
}

export const auth = crearAuth();
export const db = getFirestore(app);
