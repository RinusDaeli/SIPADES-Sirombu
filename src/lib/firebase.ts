import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let appInstance: FirebaseApp;
try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  console.warn('[Firebase] App initialization notice:', e);
  appInstance = getApps()[0] || initializeApp(firebaseConfig);
}

let dbInstance: Firestore;
try {
  dbInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(appInstance, firebaseConfig.firestoreDatabaseId)
    : getFirestore(appInstance);
} catch (e) {
  console.warn('[Firebase] Custom database fallback to default:', e);
  dbInstance = getFirestore(appInstance);
}

export const db = dbInstance;
export default appInstance;
