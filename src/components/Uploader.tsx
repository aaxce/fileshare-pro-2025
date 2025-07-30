// src/components/Uploader.tsx

'use client';

import { useState } from 'react';
import { UploadCloud, File, Check, Copy } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    setError(null);
    setUploadedUrl(null);
  };

  const copyToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
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
    setUploadedUrl(null);

    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;

    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = { timestamp, folder: 'fileshare-pro' };
      const signResponse = await fetch('/api/sign-upload', {
        method: 'POST',
        body: JSON.stringify({ paramsToSign }),
      });
      const signData = await signResponse.json();
      const { signature } = signData;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', process.env.CLOUDINARY_API_KEY as string);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', 'fileshare-pro');

      const uploadResponse = await fetch(url, { method: 'POST', body: formData });
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error.message || 'Cloudinary upload failed.');
      }
      
      setUploadedUrl(uploadData.secure_url);
      setFile(null); // Reset file input after successful upload
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Notification component */}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-xl mx-auto mt-12">
        {/* Upload Result Card */}
        {uploadedUrl ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 text-center">
            <Check className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="text-xl font-semibold text-white mt-4">Upload Successful!</h3>
            <p className="text-slate-400 mt-2">Your file is ready to be shared.</p>
            <div className="flex items-center mt-4 bg-slate-900 border border-slate-700 rounded-md p-2">
              <input
                type="text"
                readOnly
                value={uploadedUrl}
                className="w-full bg-transparent text-slate-300 focus:outline-none"
              />
              <button onClick={copyToClipboard} className="p-2 text-slate-400 hover:text-white">
                <Copy size={20} />
              </button>
            </div>
            <button
              onClick={() => setUploadedUrl(null)}
              className="mt-6 px-6 py-2 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700"
            >
              Upload Another File
            </button>
          </div>
        ) : (
          /* Upload Form Card */
          <form
            onSubmit={handleSubmit}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 text-center"
          >
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="text-xl font-semibold text-white mt-4">
              Drag and drop your file here
            </h3>
            <p className="text-slate-400 mt-2">or</p>
            <div className="mt-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer px-6 py-2 rounded-full font-semibold text-white ${uploading ? 'bg-slate-500' : 'bg-violet-600 hover:bg-violet-700'}`}
              >
                Browse File
              </label>
            </div>
            {file && !uploading && (
              <div className="mt-6 flex items-center justify-center text-white">
                <File className="mr-2" />
                <span>{file.name}</span>
              </div>
            )}
            {uploading && (
              <div className="mt-6 text-white">
                <p>Uploading {file?.name}...</p>
                {/* Simple spinner */}
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mt-2"></div>
              </div>
            )}
            {error && <p className="mt-4 text-red-500">Error: {error}</p>}
          </form>
        )}
      </div>
    </>
  );
}