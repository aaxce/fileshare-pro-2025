// src/app/api/verify-password/route.ts

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import bcrypt from 'bcrypt';

// Firebase Admin SDK ko initialize karo
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
    const { fileId, password } = await request.json();

    if (!fileId || !password) {
      return NextResponse.json({ error: 'File ID and password are required.' }, { status: 400 });
    }

    const docRef = firestore.collection('files').doc(fileId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }

    const fileData = docSnap.data();
    const hashedPassword = fileData?.password;

    if (!hashedPassword) {
      return NextResponse.json({ error: 'This file is not password protected.' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (isMatch) {
      // Password sahi hai, to Cloudinary URL bhejo
      return NextResponse.json({ cloudinaryUrl: fileData?.cloudinaryUrl });
    } else {
      // Password galat hai
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}