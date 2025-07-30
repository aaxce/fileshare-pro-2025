// src/app/download/[fileId]/page.tsx

'use client'; // Ye Client Component ban gaya hai

import { useEffect, useState } from 'react';
import { Download, KeyRound, Loader, FileQuestion, ShieldCheck } from 'lucide-react';

// File data ke liye type define karo
interface FileData {
  fileName: string;
  fileSize: number;
  hasPassword?: boolean;
}

// Helper function
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function DownloadPage({ params }: { params: { fileId: string } }) {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    // Ye function file ka public data fetch karega
    async function getPublicFileData() {
      try {
        // NOTE: Ek nayi API banani padegi jo sirf public data de.
        // For now, hum aage badhte hain aur direct password check banate hain.
        // Let's get all data at once and handle logic client-side. This is simpler for now.
        // In a real high-security app, you'd have a separate metadata endpoint.
        const docRef = firestore.collection('files').doc(params.fileId); // This won't work on client
        // Okay, let's simplify. We'll make another API to get the metadata.
      } catch (err) {
        // ...
      }
    }
    // Simplification: We will fetch all data using a server component and pass it to a client component.
    // That is too complex. Let's make the entire verification process client-side for simplicity, even if less secure.
  }, [params.fileId]);


  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: params.fileId, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      setDownloadUrl(data.cloudinaryUrl);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred.');
    } finally {
      setIsVerifying(false);
    }
  };


  // Main UI
  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      
      <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 text-center relative z-10">
        
        {downloadUrl ? (
            // State 3: Password sahi hai, download button dikhao
            <div>
                <ShieldCheck className="mx-auto h-16 w-16 text-green-400" />
                <h1 className="text-2xl font-bold text-white mt-4">File Unlocked</h1>
                 <p className="text-slate-400 mt-2">Your download is ready.</p>
                <a 
                  href={downloadUrl} 
                  download 
                  className="mt-8 inline-flex items-center justify-center px-8 py-4 rounded-full bg-violet-600 text-white font-bold text-lg hover:bg-violet-700 transition-colors"
                >
                  <Download className="mr-3" />
                  Download Now
                </a>
            </div>
        ) : (
            // State 1 & 2: Password form dikhao
            <div>
                <KeyRound className="mx-auto h-16 w-16 text-slate-400" />
                <h1 className="text-2xl font-bold text-white mt-4">This file is password protected.</h1>
                <p className="text-slate-400 mt-2">Please enter the password to download.</p>
                <form onSubmit={handlePasswordSubmit} className="mt-8">
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-slate-900 border border-slate-700 rounded-md py-3 px-4 text-white text-center focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                     <button 
                        type="submit"
                        disabled={isVerifying}
                        className="mt-4 w-full inline-flex items-center justify-center px-8 py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:bg-slate-500"
                    >
                        {isVerifying ? <Loader className="animate-spin" /> : "Unlock File"}
                    </button>
                    {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
                </form>
            </div>
        )}
      </div>
    </div>
  );
}