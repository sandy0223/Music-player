'use client'
import React from 'react'
import { Sparkles } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export default function PremiumBanner() {
  const { toast } = useToast()

  return (
    <section
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#6d28d9] via-[#2563eb] to-[#1ED760] p-8 md:p-10 transition-shadow duration-500 hover:shadow-[0_0_70px_rgba(30,215,96,0.35)]"
      aria-label="Go premium"
    >
      <span
        aria-hidden="true"
        className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-125"
      />
      <span
        aria-hidden="true"
        className="absolute -left-10 -bottom-16 size-48 rounded-full bg-black/20 blur-2xl transition-transform duration-700 group-hover:translate-x-6"
      />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white mb-3">
            <Sparkles size={13} /> Sonara Premium
          </span>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Go Premium. No Ads. Offline. High Quality.
          </h3>
          <p className="mt-2 text-sm md:text-base text-white/80 max-w-xl">
            Lossless audio, unlimited skips and full offline access — cancel anytime.
          </p>
        </div>
        <button
          onClick={() =>
            toast('Premium waitlist joined', { desc: 'We will email you when checkout opens.', variant: 'success' })
          }
          className="shrink-0 h-12 px-8 rounded-full bg-black text-white text-sm font-bold hover:scale-105 hover:shadow-[0_0_35px_rgba(0,0,0,0.5)] active:scale-100 transition-all duration-300 cursor-pointer"
        >
          Upgrade
        </button>
      </div>
    </section>
  )
}
