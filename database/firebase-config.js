
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAU8wZ6V1iJGHEbuQHDiRj9AoYWGjG4Sn4",
  authDomain: "theonyxcartel.firebaseapp.com",
  projectId: "theonyxcartel",
  storageBucket: "theonyxcartel.firebasestorage.app",
  messagingSenderId: "45490959318",
  appId: "1:45490959318:web:a37c60cda8050d4e5daa77",
  measurementId: "G-8BLQ980BQ1"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



export { db, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot };
