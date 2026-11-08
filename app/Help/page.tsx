import React from 'react'
import { LifeBuoy, Play, Heart, Upload, Radio, Volume2 } from 'lucide-react'

export const metadata = { title: 'Help Center — Sonara' }

const faqs = [
  {
    icon: Play,
    q: 'How do I play a track?',
    a: 'Click any row in a list, or hover a row and press the green play button. The bar at the bottom shows what is playing and lets you seek, skip and adjust volume.',
  },
  {
    icon: Heart,
    q: 'Where do my favorites live?',
    a: 'Tap the heart on the player bar or any full-screen player. Favorites are saved in your browser and appear under Favorites in the sidebar.',
  },
  {
    icon: Upload,
    q: 'Can I play my own files?',
    a: 'Yes — open Uploads and drop audio files in. They play locally for the current session and can be mixed into any queue or playlist.',
  },
  {
    icon: Radio,
    q: 'How does Radio differ from playlists?',
    a: 'Stations load a full queue and switch repeat to "all", so the music keeps going until you pick another station.',
  },
  {
    icon: Volume2,
    q: 'Audio does not start. What now?',
    a: 'Some networks block stream hosts. Check your connection, press play again, or hit "Try again" in the section that failed — the app automatically skips tracks that cannot stream.',
  },
]

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#1ED760]/15 border border-[#1ED760]/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1ED760] mb-4">
          <LifeBuoy size={14} /> Help Center
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">How can we help?</h1>
        <p className="mt-3 text-base text-muted-foreground">Quick answers to the questions we hear most.</p>
      </div>

      <ul className="space-y-3">
        {faqs.map(({ icon: Icon, q, a }) => (
          <li key={q} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1ED760]/15 text-[#1ED760]">
                <Icon size={17} />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-foreground">{q}</h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{a}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-white/10 p-5 text-center">
        <p className="text-sm font-bold text-foreground">Still stuck?</p>
        <p className="text-xs text-muted-foreground mt-1">Email support@sonara.example — we reply within a day.</p>
      </div>
    </div>
  )
}
