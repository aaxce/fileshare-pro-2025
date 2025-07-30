'use client';

import { useState } from 'react';
import { UploadCloud, File, Check, Copy, Link, KeyRound, Loader, ShieldCheck } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
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
    if (fileId) {
      const url = `${window.location.origin}/download/${fileId}`;
      navigator.clipboard.writeText(url);
      toast.success('Link Copied!');
    }
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
      formData.append('password', password);
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
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 text-center">
            <Check className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="text-xl font-semibold text-white mt-4">Upload Successful!</h3>
            <p className="text-slate-400 mt-2">Your file is ready to be shared.</p>
            <div className="flex items-center mt-4 bg-slate-900 border border-slate-700 rounded-md p-2">
              <Link className="text-slate-400 mr-2" size={20}/>
              <input
                type="text"
                readOnly
                value={downloadUrl}
                className="w-full bg-transparent text-slate-300 focus:outline-none"
              />
              <button onClick={copyToClipboard} className="p-2 text-slate-400 hover:text-white">
                <Copy size={20} />
              </button>
            </div>
            <button
              onClick={() => setFileId(null)}
              className="mt-6 px-6 py-2 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700"
            >
              Upload Another File
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 text-center">
            {!file && !uploading && (
              <>
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="text-xl font-semibold text-white mt-4">
                  Drag and drop your file here
                </h3>
                <p className="text-slate-400 mt-2">or</p>
                <label
                  htmlFor="file-upload"
                  className="mt-4 inline-block cursor-pointer px-6 py-2 rounded-full font-semibold text-white bg-violet-600 hover:bg-violet-700"
                >
                  Browse File
                </label>
              </>
            )}

            {file && !uploading && (
              <div className="text-white">
                <div className="flex items-center justify-center text-lg">
                  <File className="mr-3" />
                  <span>{file.name}</span>
                </div>
                
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
            
            {uploading && (
              <div className="mt-6 text-white">
                <p>Uploading {file?.name}...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mt-4"></div>
              </div>
            )}
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {error && <p className="mt-4 text-red-500">Error: {error}</p>}
          </form>
        )}
      </div>
    </>
  );
}