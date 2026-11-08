import React from 'react'
import { Scale } from 'lucide-react'

export const metadata = { title: 'Legal — Sonara' }

const sections = [
  {
    heading: 'Terms of Service',
    body: 'By using Sonara you agree to stream content for personal, non-commercial use. You are responsible for the files you upload and the playlists you create. We may suspend accounts that redistribute catalogue audio or abuse the platform.',
  },
  {
    heading: 'Privacy Policy',
    body: 'We store your favorites, playlists, downloads and playback history locally in your browser so the experience persists between visits. Nothing is sold to third parties. Clearing your browser data removes everything Sonara has stored about you.',
  },
  {
    heading: 'Cookies',
    body: 'Sonara uses local storage rather than tracking cookies. No advertising identifiers are set, and no cross-site tracking occurs anywhere in this application.',
  },
  {
    heading: 'Licensing & Catalogue',
    body: 'Streaming is powered by the Free To Use public API. All tracks are licensed under the Free To Use License — free for use under specific conditions, while commercial use requires a paid license; see freetouse.com/license for details. Track rights remain with their respective artists and rights holders. If you believe content is hosted incorrectly, contact the catalogue provider directly.',
  },
]

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#1ED760]/15 border border-[#1ED760]/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1ED760] mb-4">
          <Scale size={14} /> Legal
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">The fine print</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: November 2026</p>
      </div>

      {sections.map((s) => (
        <section key={s.heading} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-base font-extrabold text-foreground">{s.heading}</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
        </section>
      ))}
    </div>
  )
}
