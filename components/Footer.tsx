'use client'
import React from 'react'
import { Link } from '@/lib'
import { AudioWaveform, Camera, AtSign, MonitorPlay, ThumbsUp, Globe, Heart } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

const links = [
  { label: 'About', to: '/About' },
  { label: 'Careers', to: '/Careers' },
  { label: 'Legal', to: '/Legal' },
  { label: 'Help Center', to: '/Help' },
]

export default function Footer() {
  const { toast } = useToast()

  return (
    <footer className="glass rounded-2xl border-t border-white/10 px-4 sm:px-6 lg:px-8 py-8">
      {/* Three groups: brand / links / actions. Stacks on mobile, row from
          md up — and every group wraps instead of overflowing on narrow
          screens (320px+). */}
      <div className="flex flex-col items-center gap-6 md:flex-row md:flex-wrap md:justify-between md:gap-x-8 md:gap-y-6">
        <Link to="/Home" className="flex items-center gap-2 shrink-0 cursor-pointer">
          <span className="size-7 rounded-lg bg-gradient-to-br from-[#1ED760] via-[#14b8a6] to-[#6366f1] flex items-center justify-center">
            <AudioWaveform size={15} className="text-black" strokeWidth={2.5} />
          </span>
          <span className="text-sm font-extrabold text-white">Sonara</span>
        </Link>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-6"
          aria-label="Footer"
        >
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors cursor-pointer"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {[
            { icon: Camera, label: 'Instagram' },
            { icon: AtSign, label: 'Twitter' },
            { icon: MonitorPlay, label: 'YouTube' },
            { icon: ThumbsUp, label: 'Facebook' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => toast(`Sonara on ${label}`, { desc: 'Social links are coming soon.', variant: 'info' })}
              className="size-9 sm:size-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-[#1ED760] hover:bg-white/5 transition-colors cursor-pointer"
              aria-label={label}
            >
              <Icon size={17} />
            </button>
          ))}
          <button
            onClick={() => toast('Language: English', { desc: 'More languages coming soon.', variant: 'info' })}
            className="ml-1 sm:ml-2 flex items-center gap-1.5 h-9 px-3 rounded-full border border-white/15 text-xs font-semibold text-muted-foreground hover:text-white hover:border-white/30 transition-colors cursor-pointer"
          >
            <Globe size={14} /> English
          </button>
        </div>
      </div>

      {/* Credit + attribution line — wraps cleanly on small screens. */}
      <div className="mt-6 flex flex-col items-center gap-2 border-t border-white/5 pt-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-xs text-muted-foreground">
          © 2026 Sonara Media, Inc. All rights reserved. Music provided by{' '}
          <a
            href="https://freetouse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#1ED760] transition-colors"
          >
            Free To Use
          </a>
          .
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Developed with <Heart size={12} className="text-[#1ED760] fill-[#1ED760]" aria-hidden="true" /> by{' '}
          <span className="font-semibold text-white">Sandeep</span>
        </p>
      </div>
    </footer>
  )
}
