// src/components/Uploader.tsx

'use client';

import { useState } from 'react';
import { UploadCloud, File, Check, Copy, Link, KeyRound } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>(''); // Password ke liye naya state
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    setError(null);
    setFileId(null);
    setPassword('');
  };

  const copyToClipboard = () => {
    // ... ye function same rahega ...
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setFileId(null);
    
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password); // Password ko form data mein add karo
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');

      setFileId(data.id);
      setFile(null);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred.');
    } finally {
      setUploading(false);
    }
  };

  const downloadUrl = fileId ? `${window.location.origin}/download/${fileId}` : '';

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-xl mx-auto mt-12">
        {fileId ? (
          // ... Success card ka code same rahega ...
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 text-center">
            {/* Jab file select nahi hai, to ye dikhega */}
            {!file && !uploading && (
                // ... ye UI same rahega ...
            )}

            {/* Jab file select ho jaye, to ye dikhega */}
            {file && !uploading && (
              <div className="text-white">
                <div className="flex items-center justify-center text-lg">
                  <File className="mr-3" />
                  <span>{file.name}</span>
                </div>
                
                {/* Naya Password Field */}
                <div className="relative mt-6">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Add a password (optional)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full px-8 py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                >
                  Upload File
                </button>
              </div>
            )}
            
            {/* Jab uploading chal rahi ho */}
            {uploading && (
              // ... ye UI same rahega ...
            )}

            {error && <p className="mt-4 text-red-500">Error: {error}</p>}
          </form>
        )}
      </div>
    </>
  );
}