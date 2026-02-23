// // lib/firebase.ts
// import { initializeApp, getApps } from 'firebase/app'
// import { 
//   getFirestore, 
//   collection, 
//   addDoc, 
//   updateDoc, 
//   deleteDoc, 
//   setDoc,
//   doc, 
//   getDocs,
//   Timestamp,
//   getDoc
// } from 'firebase/firestore'
// import { getStorage } from 'firebase/storage'
// import { 
//   getAuth, 
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   updateProfile
// } from 'firebase/auth'

// const firebaseConfig = {
//   apiKey: "AIzaSyB5cA4xnm-SO5XoteZef1GF5IfJWXjPwsQ",
//   authDomain: "ragdolproperties-5d530.firebaseapp.com",
//   projectId: "ragdolproperties-5d530",
//   storageBucket: "ragdolproperties-5d530.firebasestorage.app",
//   messagingSenderId: "501791621232",
//   appId: "1:501791621232:web:bd3beda6fd2e5a9fadf4b5",
//   measurementId: "G-YHQ4QH63WH"
// }

// // ✅ IMPORTANT: Check if app is already initialized
// let app
// if (!getApps().length) {
//   app = initializeApp(firebaseConfig)
// } else {
//   app = getApps()[0]
// }

// export const db = getFirestore(app)
// export const storage = getStorage(app)
// export const auth = getAuth(app)

// // Export all Firestore utilities
// export { 
//   collection, 
//   addDoc, 
//   updateDoc, 
//   deleteDoc, 
//   doc, 
//   setDoc,
//   getDocs,
//   getDoc,
//   Timestamp
// }

// // Export Auth functions
// export {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   updateProfile
// }



// new code
// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  doc, 
  getDocs,
  Timestamp,
  getDoc
} from 'firebase/firestore'
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage'
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyB5cA4xnm-SO5XoteZef1GF5IfJWXjPwsQ",
  authDomain: "ragdolproperties-5d530.firebaseapp.com",
  projectId: "ragdolproperties-5d530",
  storageBucket: "ragdolproperties-5d530.firebasestorage.app",
  messagingSenderId: "501791621232",
  appId: "1:501791621232:web:bd3beda6fd2e5a9fadf4b5",
  measurementId: "G-YHQ4QH63WH"
}

// ✅ IMPORTANT: Check if app is already initialized
let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

// Export all Firestore utilities
export { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDocs,
  getDoc,
  Timestamp
}

// Export Storage utilities
export {
  ref,
  uploadBytes,
  getDownloadURL
}

// Export Auth functions
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
}