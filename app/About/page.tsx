import React from 'react'
import { AudioWaveform, Music2, Users, Shield } from 'lucide-react'

export const metadata = { title: 'About — Sonara' }

const values = [
  {
    icon: Music2,
    title: 'Sound first',
    desc: 'Every decision we make starts with the music — clean interfaces, honest recommendations, no dark patterns.',
  },
  {
    icon: Users,
    title: 'Artists get paid',
    desc: 'Half of every premium subscription goes directly to the artists you actually listen to.',
  },
  {
    icon: Shield,
    title: 'Your data, your rules',
    desc: 'No selling listening history, ever. Export or delete everything with one tap.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#1ED760]/15 border border-[#1ED760]/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1ED760] mb-4">
          <AudioWaveform size={14} /> About Sonara
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Your sound, your way — built for listeners and creators alike.
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Sonara is a streaming home for people who care about discovery. We combine editorial curation with a
          community-powered catalogue so the next great track is always one tap away — whether you are hunting for
          underground gems or queuing up a Friday-night playlist.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {values.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <Icon size={20} className="text-[#1ED760] mb-3" />
            <h2 className="text-sm font-extrabold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#6d28d9]/30 via-[#2563eb]/20 to-[#1ED760]/20 p-6">
        <h2 className="text-lg font-extrabold text-foreground">The numbers</h2>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {[
            { value: '80M+', label: 'Tracks streamed monthly' },
            { value: '190', label: 'Countries listening' },
            { value: '50%', label: 'Revenue to artists' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl md:text-3xl font-extrabold text-[#1ED760]">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Sonara is a demo application. Catalogue data, artwork and streams are provided by the
        <a href="https://freetouse.com" target="_blank" rel="noopener noreferrer" className="text-[#1ED760] hover:underline"> Free To Use</a> public API under the
        <a href="https://freetouse.com/license" target="_blank" rel="noopener noreferrer" className="text-[#1ED760] hover:underline"> Free To Use License</a>.
      </p>
    </div>
  )
}
