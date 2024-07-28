import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAzqte2w6CDiFbE6Ox3iBfsZ2pT1Hy_-3c",
  authDomain: "gestaocombo-93bb4.firebaseapp.com",
  projectId: "gestaocombo-93bb4",
  storageBucket: "gestaocombo-93bb4.appspot.com",
  messagingSenderId: "722880187648",
  appId: "1:722880187648:web:22346016401fef925277e5",
  measurementId: "G-3N2LG1XPD5",
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage };
