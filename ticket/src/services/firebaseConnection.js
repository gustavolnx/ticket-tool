import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA4viiTVZaMtNFyok_8wE5LmmczjOOepsM",
  authDomain: "ticket-fc977.firebaseapp.com",
  projectId: "ticket-fc977",
  storageBucket: "ticket-fc977.appspot.com",
  messagingSenderId: "589594498652",
  appId: "1:589594498652:web:f73791b952adf7ee31b899",
  measurementId: "G-55VYP2HY7S"
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage };
