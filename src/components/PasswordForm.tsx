// src/components/PasswordForm.tsx

'use client';

import { useState } from 'react';
import { Download, KeyRound, Loader, ShieldCheck } from 'lucide-react';

export default function PasswordForm({ fileId }: { fileId: string }) {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);
    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: fileId, password }),
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

  if (downloadUrl) {
    return (
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
    );
  }

  return (
    <div>
      <KeyRound className="mx-auto h-16 w-16 text-slate-400" />
      <h1 className="text-2xl font-bold text-white mt-4">Password Protected</h1>
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
  );
}