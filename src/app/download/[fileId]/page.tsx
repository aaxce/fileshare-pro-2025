// src/app/download/[fileId]/page.tsx

import admin from 'firebase-admin';
import { Download, FileQuestion } from 'lucide-react';
import PasswordForm from '@/components/PasswordForm';

// Firebase Admin SDK Initialization
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

// Helper function to format file size
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Yahan PageProps ko badal diya hai
interface DownloadPageProps {
  params: { fileId: string };
}

async function getFileData(id: string) {
  try {
    const docSnap = await firestore.collection('files').doc(id).get();
    return docSnap.exists ? docSnap.data() : null;
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const fileData = await getFileData(params.fileId);

  const mainContent = () => {
    if (!fileData) {
      return (
        <div className="text-center">
          <FileQuestion className="mx-auto h-16 w-16 text-slate-400" />
          <h1 className="text-2xl font-bold text-white mt-4">File Not Found</h1>
          <p className="text-slate-400 mt-2">This link may have expired or is incorrect.</p>
        </div>
      );
    }

    if (fileData.password) {
      return <PasswordForm fileId={params.fileId} />;
    }

    return (
      <div className="text-center">
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
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      
      <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 relative z-10">
        {mainContent()}
      </div>
    </div>
  );
}