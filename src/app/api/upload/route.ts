// src/app/api/upload/route.ts

import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000, 
});

export async function POST(request: Request) {
  // ... (function ka baaki hissa same rahega) ...
  const file = //...
  const buffer = //...

  try {
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

    // Yahan par 'any' hata diya hai
    return NextResponse.json({
      message: 'File uploaded successfully',
      url: result?.secure_url,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
