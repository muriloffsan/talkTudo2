//Murilo Ferreira Faria Santana e Pedro Zocatelli
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB4WZh1AiWfpKcde0DmqlnoFei86Xe3v0k",
    authDomain: "app-talktudo2.firebaseapp.com",
    projectId: "app-talktudo2",
    storageBucket: "app-talktudo2.firebasestorage.app",
    messagingSenderId: "190506345865",
    appId: "1:190506345865:web:31f4dac318159c0e0fad58",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
