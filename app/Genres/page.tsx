'use client'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Play, Coffee, Dumbbell, Guitar, Brain, Piano, PartyPopper, Radio, Moon, Zap, Mic2, Music2, Waves, Heart } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import TrackRow from '@/components/TrackRow'
import { TrackListSkeleton, EmptyState, ErrorState } from '@/components/States'
import { usePlayer } from '@/context/PlayerContext'
import { cn, getGenreTracks, type Track } from '@/lib'

interface GenreDef {
  name: string
  icon: typeof Coffee
  gradient: string
}

const genreDefs: GenreDef[] = [
  { name: 'Chill', icon: Coffee, gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)' },
  { name: 'Workout', icon: Dumbbell, gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
  { name: 'Indie', icon: Guitar, gradient: 'linear-gradient(135deg, #a855f7, #ec4899)' },
  { name: 'Focus', icon: Brain, gradient: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' },
  { name: 'Jazz', icon: Piano, gradient: 'linear-gradient(135deg, #eab308, #b45309)' },
  { name: 'Dance', icon: PartyPopper, gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { name: 'Lo-Fi', icon: Radio, gradient: 'linear-gradient(135deg, #22c55e, #059669)' },
  { name: 'Sleep', icon: Moon, gradient: 'linear-gradient(135deg, #4f46e5, #1e1b4b)' },
  { name: 'Electronic', icon: Zap, gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { name: 'HipHop', icon: Mic2, gradient: 'linear-gradient(135deg, #f59e0b, #b91c1c)' },
  { name: 'Rock', icon: Music2, gradient: 'linear-gradient(135deg, #64748b, #1e293b)' },
  { name: 'Pop', icon: Heart, gradient: 'linear-gradient(135deg, #f472b6, #db2777)' },
  { name: 'Soul', icon: Waves, gradient: 'linear-gradient(135deg, #8b5cf6, #4c1d95)' },
]

function GenresContent() {
  const params = useSearchParams()
  const router = useRouter()
  const selected = params.get('g')
  const { playQueue } = usePlayer()

  const [tracks, setTracks] = useState<Track[] | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    if (!selected) return
    setTracks(null)
    setError(false)
    getGenreTracks(selected, 30)
      .then(setTracks)
      .catch(() => setError(true))
  }, [selected])

  useEffect(load, [load])

  const def = genreDefs.find((g) => g.name === selected)

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title={selected ? `${def?.name ?? selected} Picks` : 'Genres & Moods'}
        subtitle={selected ? `Hand-picked ${selected.toLowerCase()} tracks, streaming now` : 'Pick a mood and press play'}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-10">
        {genreDefs.map(({ name, icon: Icon, gradient }) => {
          const active = name === selected
          return (
            <button
              key={name}
              onClick={() => router.push(`/Genres?g=${encodeURIComponent(name)}`)}
              className={cn(
                'group relative h-32 sm:h-36 rounded-xl overflow-hidden p-4 flex flex-col justify-between items-start text-left border transition-all cursor-pointer',
                active ? 'border-[#1ED760] shadow-[0_0_30px_rgba(30,215,96,0.35)]' : 'border-white/10',
              )}
              aria-label={`Browse ${name}`}
              aria-pressed={active}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-125 group-hover:rotate-6"
                style={{ background: gradient }}
              />
              <span aria-hidden="true" className="absolute inset-0 bg-black/25 group-hover:bg-black/0 transition-colors duration-500" />
              <Icon size={24} className="relative z-10 text-white/90 drop-shadow-md" strokeWidth={2} />
              <span className="relative z-10 text-lg font-extrabold text-white">{name}</span>
            </button>
          )
        })}
      </div>

      {selected && (
        <section aria-label={`${selected} tracks`}>
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
                Top {def?.name ?? selected}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Tap any track to start streaming</p>
            </div>
            <button
              onClick={() => tracks && tracks.length > 0 && playQueue(tracks, 0)}
              disabled={!tracks?.length}
              className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#1ED760] text-black text-sm font-bold hover:shadow-[0_0_30px_rgba(30,215,96,0.5)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Play size={16} className="fill-black" /> Play all
            </button>
          </div>

          {error ? (
            <ErrorState message={`Could not load ${selected} tracks.`} onRetry={load} />
          ) : tracks === null ? (
            <TrackListSkeleton rows={8} />
          ) : tracks.length === 0 ? (
            <EmptyState title="No tracks found" desc={`Nothing streaming in ${selected} right now.`} />
          ) : (
            <ol className="divide-y divide-white/5">
              {tracks.map((track, i) => (
                <TrackRow key={track.id} track={track} queue={tracks} index={i + 1} />
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  )
}

export default function GenresPage() {
  return (
    <Suspense fallback={<TrackListSkeleton rows={8} />}>
      <GenresContent />
    </Suspense>
  )
}
