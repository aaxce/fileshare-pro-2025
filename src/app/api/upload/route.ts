// src/app/api/upload/route.ts

import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Cloudinary ko configure karo
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000, // Timeout set to 120 seconds (2 minutes)
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  // File ko buffer mein convert karo
  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  try {
    // Buffer ko Cloudinary par upload karo
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'fileshare-pro',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      url: (result as any).secure_url,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}