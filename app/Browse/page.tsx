'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Play, TrendingUp } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import PlaylistCarousel from '@/components/PlaylistCarousel'
import TrackRow from '@/components/TrackRow'
import SectionHeader from '@/components/SectionHeader'
import { TrackListSkeleton, ErrorState } from '@/components/States'
import { Input } from '@/components/ui/input'
import { usePlayer } from '@/context/PlayerContext'
import { getTrending, type Track } from '@/lib/freetouse'

export default function BrowsePage() {
  const router = useRouter()
  const { playQueue } = usePlayer()
  const [query, setQuery] = useState('')
  const [trending, setTrending] = useState<Track[] | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    setError(false)
    setTrending(null)
    getTrending({ limit: 15 })
      .then(setTrending)
      .catch(() => setError(true))
  }, [])

  useEffect(load, [load])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/Search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div>
        <PageHeader title="Browse" subtitle="Search the catalogue or dive into a chart" />
        <form onSubmit={submit} className="relative max-w-xl" role="search">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, playlists…"
            aria-label="Search"
            className="h-12 rounded-full bg-white/10 border-transparent pl-11 pr-4 text-sm text-white placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#1ED760] focus-visible:border-transparent"
          />
        </form>
      </div>

      <PlaylistCarousel title="Editorial Playlists" subtitle="Curated collections from the Sonara team" actionLabel="Charts" actionTo="/Charts" />

      <section aria-label="Trending now">
        <SectionHeader title="Trending Now" subtitle="What everyone is playing this week" actionLabel="Full charts" actionTo="/Charts" />
        {error ? (
          <ErrorState message="Could not load trending tracks." onRetry={load} />
        ) : trending === null ? (
          <TrackListSkeleton rows={8} />
        ) : (
          <>
            <button
              onClick={() => playQueue(trending, 0)}
              className="mb-3 flex items-center gap-2 h-9 px-4 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider text-foreground hover:border-[#1ED760] hover:text-[#1ED760] transition-colors cursor-pointer"
            >
              <Play size={13} className="fill-current" /> Play all
            </button>
            <ol className="divide-y divide-white/5">
              {trending.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  queue={trending}
                  index={i + 1}
                  move={i % 3 === 0 ? 'up' : i % 3 === 1 ? 'same' : 'down'}
                  meta={
                    <span className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-[#1ED760]" />
                      {track.plays ? `${Math.round(track.plays / 1000)}k` : ''}
                    </span>
                  }
                />
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  )
}
