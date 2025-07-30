// src/app/api/sign-upload/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const { paramsToSign } = await request.json();
  try {
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );
    return NextResponse.json({ signature });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sign upload' }, { status: 500 });
  }
}