import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import bcrypt from 'bcrypt';

// Firebase Admin SDK Initialization
if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
    if (!serviceAccountBase64) {
      throw new Error('Firebase service account key not found.');
    }
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('ascii'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const firestore = admin.firestore();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000,
});

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
    // Step 1: Upload file to Cloudinary
    const result = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'fileshare-pro' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    if (!result) {
        throw new Error('Cloudinary upload failed.');
    }

    // Step 2: Prepare file details for Firestore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileData: { [key: string]: any } = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudinaryUrl: result.secure_url,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // If password exists, hash and add it
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      fileData.password = hashedPassword;
    }

    // Step 3: Save details to Firestore
    const docRef = await firestore.collection('files').add(fileData);

    // Step 4: Return the file's unique ID to the frontend
    return NextResponse.json({
      message: 'File uploaded successfully',
      id: docRef.id,
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}