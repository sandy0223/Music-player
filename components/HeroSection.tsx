'use client'
import React from 'react'
import { motion } from 'motion/react'
import { Play, Sparkles } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

const HERO_IMG =
  'https://uxcanvas.ai/api/generated-images/666f5970-566e-454b-b5ec-da8b4998a1e4/0d38c207-5316-4144-8535-c21c86f1e96b'

interface HeroSectionProps {
  onPlay: () => void
}

export default function HeroSection({ onPlay }: HeroSectionProps) {
  const { toast } = useToast()

  return (
    <section className="relative overflow-hidden rounded-3xl h-[440px] md:h-[520px] border border-white/10" aria-label="Featured">
      <motion.img
        src={HERO_IMG}
        alt="Concert crowd silhouetted under green neon stage lights"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1.02 }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" aria-hidden="true" />

      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 max-w-2xl">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1ED760]/15 border border-[#1ED760]/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1ED760] mb-4"
        >
          <Sparkles size={14} /> Featured Artist
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05]"
        >
          Your Sound,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1ED760] to-[#14b8a6]">Your Way</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-4 text-base md:text-lg text-muted-foreground"
        >
          Unlimited streaming. Personalized for you.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-7 flex flex-wrap items-center gap-3"
        >
          <button
            onClick={onPlay}
            className="flex items-center gap-2 h-12 px-7 rounded-full bg-[#1ED760] text-black text-sm font-bold hover:shadow-[0_0_40px_rgba(30,215,96,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
          >
            <Play size={18} className="fill-black" /> Play Now
          </button>
          <button
            onClick={() =>
              toast('Premium waitlist joined', { desc: 'We will email you when checkout opens.', variant: 'success' })
            }
            className="h-12 px-7 rounded-full border border-white/40 text-white text-sm font-bold backdrop-blur-sm hover:border-[#1ED760] hover:text-[#1ED760] hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(30,215,96,0.25)] transition-all duration-300 cursor-pointer"
          >
            Try Premium
          </button>
        </motion.div>
      </div>
    </section>
  )
}
