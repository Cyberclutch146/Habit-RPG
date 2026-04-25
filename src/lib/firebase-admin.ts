import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // This expects GOOGLE_APPLICATION_CREDENTIALS env var
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
