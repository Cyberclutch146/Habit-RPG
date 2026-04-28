import admin from 'firebase-admin';

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Try service account JSON from env var (for Vercel/production)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      });
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    }
  }

  // Fallback to Application Default Credentials (local dev with gcloud CLI)
  try {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
    });
  } catch (e) {
    console.error('⚠️  No Firebase Admin credentials found!');
    console.error('   Set FIREBASE_SERVICE_ACCOUNT_KEY env var with your service account JSON,');
    console.error('   or run: gcloud auth application-default login');
    throw new Error('Firebase Admin initialization failed');
  }
}

const app = getFirebaseAdmin();
const adminDb = admin.firestore(app);
const adminAuth = admin.auth(app);

export { admin, adminDb, adminAuth };
