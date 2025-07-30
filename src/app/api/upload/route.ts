// src/app/api/upload/route.ts

import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import bcrypt from 'bcrypt';

// ... (Firebase aur Cloudinary ka config code same rahega) ...

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const password = formData.get('password') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  try {
    // Step 1: File ko Cloudinary par upload karo
    const result = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
        // ... (ye code same rahega) ...
    });

    if (!result) throw new Error('Cloudinary upload failed.');

    // Step 2: File ki details tayyar karo
    const fileData: { [key: string]: any } = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudinaryUrl: result.secure_url,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Agar password hai, to usko hash karke add karo
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      fileData.password = hashedPassword;
    }

    // Step 3: Data ko Firestore mein save karo
    const docRef = await firestore.collection('files').add(fileData);

    return NextResponse.json({
      message: 'File uploaded successfully',
      id: docRef.id,
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}