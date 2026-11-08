'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { AudioWaveform, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-24 text-center">
      <span className="size-16 rounded-2xl bg-gradient-to-br from-[#1ED760] via-[#14b8a6] to-[#6366f1] flex items-center justify-center shadow-[0_0_40px_rgba(30,215,96,0.4)] mb-6">
        <AudioWaveform size={30} className="text-black" strokeWidth={2.5} />
      </span>
      <p className="text-6xl font-extrabold text-[#1ED760] tabular-nums">404</p>
      <h1 className="text-2xl font-extrabold text-foreground mt-3">This track skipped</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        The page you are looking for does not exist — the queue moved on without it.
      </p>
      <button
        onClick={() => router.push('/Home')}
        className="mt-6 flex items-center gap-2 h-11 px-6 rounded-full bg-[#1ED760] text-black text-sm font-bold hover:shadow-[0_0_35px_rgba(30,215,96,0.5)] transition-all cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>
    </div>
  )
}
