import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // If you decide to use Firebase Auth later
// import { getStorage } from "firebase/storage"; // If you decide to use Firebase Storage later

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUbHevG-SpqLBlvbT9nXAIAOUO6d86W2o",
    authDomain: "cash-tracker-4802f.firebaseapp.com",
    projectId: "cash-tracker-4802f",
    storageBucket: "cash-tracker-4802f.firebasestorage.app",
    messagingSenderId: "302784260827",
    appId: "1:302784260827:web:93d5f4bce4850a23b3bafe"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize other Firebase services as needed
// export const auth = getAuth(app);
// export const storage = getStorage(app);

// It's a good practice to also export the app instance if you need it elsewhere
export default app; 
