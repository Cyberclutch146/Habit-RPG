import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../../lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (decodedToken.firebase.sign_in_provider !== 'anonymous') {
      return NextResponse.json({ error: 'Only anonymous sessions can be wiped.' }, { status: 403 });
    }

    const uid = decodedToken.uid;

    // Helper to delete a Firestore collection
    async function deleteCollection(path: string) {
      const colRef = adminDb.collection(path);
      const snapshot = await colRef.get();
      if (snapshot.size === 0) return;
      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // Wipe user data
    await deleteCollection(`users/${uid}/logs`);
    await deleteCollection(`users/${uid}/habits`);
    await adminDb.collection('users').doc(uid).delete();

    // Delete from Firebase Auth
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ message: 'Guest data wiped successfully.' });
  } catch (error) {
    console.error('Wipe Guest Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
