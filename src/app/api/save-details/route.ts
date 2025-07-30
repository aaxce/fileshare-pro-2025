// src/app/api/save-details/route.ts
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import bcrypt from 'bcrypt';

if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
    if (!serviceAccountBase64) throw new Error('Firebase service account key not found.');
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('ascii'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const firestore = admin.firestore();

export async function POST(request: Request) {
  try {
    const { fileDetails, password } = await request.json();

    const fileData: { [key: string]: any } = {
      ...fileDetails,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fileData.password = hashedPassword;
    }

    const docRef = await firestore.collection('files').add(fileData);
    return NextResponse.json({ id: docRef.id });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to save details' }, { status: 500 });
  }
}