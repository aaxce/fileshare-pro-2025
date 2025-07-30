import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Firebase Admin SDK ko initialize karo
// Pehle check karo ki app pehle se initialized to nahi hai
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

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  try {
    // Step 1: File ko Cloudinary par upload karo
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

    // Step 2: File ki details Firestore mein save karo
    const fileData = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudinaryUrl: result.secure_url,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection('files').add(fileData);

    // Step 3: Frontend ko file ka ID bhejo
    return NextResponse.json({
      message: 'File uploaded successfully',
      id: docRef.id, // Ab hum Cloudinary URL ki jagah Document ID bhej rahe hain
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}