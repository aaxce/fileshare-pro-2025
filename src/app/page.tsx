// src/app/page.tsx

import Uploader from '@/components/Uploader';

export default function HomePage() {
  return (
    // Background
    <div className="relative h-full w-full bg-slate-950">
      <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
      
      {/* Content */}
      <main className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-white mt-12 md:mt-20">
          Upload Your File
        </h1>
        <p className="text-center text-slate-400 mt-4">
          Get a shareable link instantly.
        </p>
        <Uploader />
      </main>
    </div>
  );
}