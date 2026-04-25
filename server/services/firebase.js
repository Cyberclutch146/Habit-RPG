const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'habit-rpg-blazi-dev';

  // Try multiple credential strategies in order of preference
  let credential;

  // 1. Explicit service account key file
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS 
    || path.join(__dirname, '..', 'serviceAccountKey.json');
  
  if (fs.existsSync(keyPath)) {
    console.log(`🔑 Using service account key: ${keyPath}`);
    credential = admin.credential.cert(require(keyPath));
  } else {
    // 2. Application Default Credentials (gcloud CLI, Cloud Run, etc.)
    try {
      credential = admin.credential.applicationDefault();
      console.log('🔑 Using application default credentials');
    } catch (e) {
      console.error('⚠️  No Firebase Admin credentials found!');
      console.error('   Fix: Download a service account key from Firebase Console:');
      console.error('   https://console.firebase.google.com/project/' + projectId + '/settings/serviceaccounts/adminsdk');
      console.error('   Save it as server/serviceAccountKey.json');
      process.exit(1);
    }
  }

  admin.initializeApp({ credential, projectId });
  console.log(`🔥 Firebase Admin initialized for project: ${projectId}`);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
