// C:\Users\gerim\Desktop\DashBoard\dashboard\firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';  // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyB0Wp-DZHfE80k6E60Cxt9ziTT8TnxyVb8",
  authDomain: "shinecity-form.firebaseapp.com",
  projectId: "shinecity-form",
  storageBucket: "shinecity-form.appspot.com",
  messagingSenderId: "448829430335",
  appId: "1:448829430335:web:9daf36d4d9d1ea5681b68a",
  measurementId: "G-L33X470NCE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Initialize Firestore

export { db };
