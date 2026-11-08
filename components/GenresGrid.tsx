'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Coffee, Dumbbell, Guitar, Brain, Piano, PartyPopper, Radio, Moon } from 'lucide-react'
import SectionHeader from './SectionHeader'

const genres = [
  { name: 'Chill', icon: Coffee, gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)' },
  { name: 'Workout', icon: Dumbbell, gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
  { name: 'Indie', icon: Guitar, gradient: 'linear-gradient(135deg, #a855f7, #ec4899)' },
  { name: 'Focus', icon: Brain, gradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' },
  { name: 'Jazz', icon: Piano, gradient: 'linear-gradient(135deg, #eab308, #b45309)' },
  { name: 'Dance', icon: PartyPopper, gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { name: 'Lo-Fi', icon: Radio, gradient: 'linear-gradient(135deg, #22c55e, #059669)' },
  { name: 'Sleep', icon: Moon, gradient: 'linear-gradient(135deg, #4f46e5, #1e1b4b)' },
]

export { genres }

export default function GenresGrid() {
  const router = useRouter()

  return (
    <section aria-label="Explore genres and moods">
      <SectionHeader
        title="Explore Genres & Moods"
        subtitle="Find the perfect soundtrack for any moment"
        actionLabel="All genres"
        actionTo="/Genres"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {genres.map(({ name, icon: Icon, gradient }) => (
          <button
            key={name}
            onClick={() => router.push(`/Genres?g=${encodeURIComponent(name)}`)}
            className="group relative h-36 sm:h-40 rounded-xl overflow-hidden p-4 flex flex-col justify-between items-start text-left border border-white/10 cursor-pointer"
            aria-label={`Browse ${name}`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-125 group-hover:rotate-6"
              style={{ background: gradient }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-black/25 group-hover:bg-black/0 transition-colors duration-500"
            />
            <Icon size={26} className="relative z-10 text-white/90 drop-shadow-md" strokeWidth={2} />
            <span className="relative z-10">
              <span className="block text-lg font-extrabold text-white">{name}</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/85 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Browse <ArrowRight size={12} />
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
