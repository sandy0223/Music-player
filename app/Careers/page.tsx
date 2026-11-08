import React from 'react'
import { Briefcase, MapPin, Clock, Heart } from 'lucide-react'

export const metadata = { title: 'Careers — Sonara' }

const roles = [
  { title: 'Senior Frontend Engineer', team: 'Engineering', place: 'Remote (EU)', type: 'Full-time' },
  { title: 'Playlist Curator, Electronic', team: 'Editorial', place: 'London, UK', type: 'Full-time' },
  { title: 'Artist Relations Manager', team: 'Creator', place: 'New York, US', type: 'Full-time' },
  { title: 'Product Design Intern', team: 'Design', place: 'Remote', type: 'Internship' },
]

export default function CareersPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#1ED760]/15 border border-[#1ED760]/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1ED760] mb-4">
          <Briefcase size={14} /> Careers
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Help us build the way the world listens.
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          We are a small, remote-first team that ships fast and listens even faster. If you love music and clean code,
          we should talk.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin size={14} className="text-[#1ED760]" /> Remote-first
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} className="text-[#1ED760]" /> Flexible hours
        </span>
        <span className="flex items-center gap-1.5">
          <Heart size={14} className="text-[#1ED760]" /> Full health cover
        </span>
      </div>

      <ul className="divide-y divide-white/5 rounded-xl border border-white/10 overflow-hidden">
        {roles.map((role) => (
          <li key={role.title} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors">
            <div>
              <p className="text-sm font-bold text-foreground">{role.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {role.team} · {role.place} · {role.type}
              </p>
            </div>
            <button
              type="button"
              className="h-9 px-5 rounded-full border border-white/20 text-xs font-bold text-foreground hover:border-[#1ED760] hover:text-[#1ED760] transition-colors cursor-pointer"
            >
              Apply
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">
        Don&apos;t see your role? Send a note to careers@sonara.example and tell us what you would build.
      </p>
    </div>
  )
}
