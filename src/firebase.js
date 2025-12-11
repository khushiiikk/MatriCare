import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration provided by user
const firebaseConfig = {
    apiKey: "AIzaSyCdDLXbwxSl06fSSZEoI5s404SIQ0JlYEw",
    authDomain: "matricare-c9ece.firebaseapp.com",
    projectId: "matricare-c9ece",
    storageBucket: "matricare-c9ece.firebasestorage.app",
    messagingSenderId: "6494189528",
    appId: "1:6494189528:web:e326e3f06c97555db4e4ad",
    measurementId: "G-G5N0L4Y3PK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
