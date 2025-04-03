import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAcqNe1but9cY6ItgwGBpnLZ8eZSy02OOo",
  authDomain: "homerental-173de.firebaseapp.com",
  projectId: "homerental-173de",
  storageBucket: "homerental-173de.firebasestorage.app",
  messagingSenderId: "768104079318",
  appId: "1:768104079318:web:112de7f130b3c75a394e77",
  measurementId: "G-9WCHM333C6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };