// src/app/download/[fileId]/page.tsx

import admin from 'firebase-admin';
import { Download } from 'lucide-react';

// Firebase Admin SDK ko initialize karo
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

// Helper function to format file size
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


// Page component
async function getFileData(id: string) {
  try {
    const docRef = firestore.collection('files').doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
}

export default async function DownloadPage({ params }: { params: { fileId: string } }) {
  const fileData = await getFileData(params.fileId);

  if (!fileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white text-center">
        <h1 className="text-4xl font-bold">File Not Found</h1>
        <p className="text-slate-400 mt-2">This link may have expired or is incorrect.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex items-center justify-center">
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      
      <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 text-center relative z-10">
        <h1 className="text-2xl font-bold text-white break-words">
            {fileData.fileName}
        </h1>
        <p className="text-slate-400 mt-2">
            File Size: {formatBytes(fileData.fileSize)}
        </p>

        <a 
          href={fileData.cloudinaryUrl} 
          download 
          className="mt-8 inline-flex items-center justify-center px-8 py-4 rounded-full bg-violet-600 text-white font-bold text-lg hover:bg-violet-700 transition-colors"
        >
          <Download className="mr-3" />
          Download File
        </a>
      </div>
    </div>
  );
}