// Import necessary modules
import { initializeApp } from "firebase/app";
import { getAuth ,initializeAuth, getReactNativePersistence } from "firebase/auth"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB3TmEljKM0LSvTfhSB01SLg5cIglRmHI",
  authDomain: "rn-chat-113b0.firebaseapp.com",
  projectId: "rn-chat-113b0",
  storageBucket: "rn-chat-113b0.appspot.com",
  messagingSenderId: "1076131412107",
  appId: "1:1076131412107:web:d09e4aec32c4071719fc8e",
};

// Initialize Firebase App
export const FIREBASE_APP = initializeApp(firebaseConfig);

// Initialize Firestore
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);

// Initialize Firebase Auth with React Native persistence
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage),
});
