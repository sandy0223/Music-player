'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Play, Sparkles, UserPlus, CheckCircle2 } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionHeader from '@/components/SectionHeader'
import TrackRow from '@/components/TrackRow'
import { TrackListSkeleton, ErrorState } from '@/components/States'
import { usePlayer } from '@/context/PlayerContext'
import { useLibrary } from '@/context/LibraryContext'
import { useToast } from '@/context/ToastContext'
import { getTrending, getViral, getTopArtists, type Artist, type Track } from '@/lib/freetouse'

export default function DiscoverPage() {
  const { playQueue } = usePlayer()
  const library = useLibrary()
  const { toast } = useToast()

  const [fresh, setFresh] = useState<Track[] | null>(null)
  const [trending, setTrending] = useState<Track[] | null>(null)
  const [artists, setArtists] = useState<Artist[] | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    setError(false)
    setFresh(null)
    setTrending(null)
    setArtists(null)
    Promise.all([getViral(12), getTrending({ limit: 12 }), getTopArtists(6)])
      .then(([u, t, a]) => {
        setFresh(u)
        setTrending(t)
        setArtists(a)
      })
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Discover" subtitle="Fresh finds, picked for you" />
        <ErrorState message="Could not load Discover." onRetry={load} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <PageHeader title="Discover" subtitle="Fresh finds, deep cuts and artists to watch">
        <button
          onClick={() => trending && playQueue(trending, 0)}
          disabled={!trending}
          className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#1ED760] text-black text-sm font-bold hover:shadow-[0_0_30px_rgba(30,215,96,0.5)] transition-all cursor-pointer disabled:opacity-50"
        >
          <Play size={16} className="fill-black" /> Play mix
        </button>
      </PageHeader>

      <section aria-label="Fresh releases">
        <SectionHeader title="Fresh Drops" subtitle="Tracks bubbling up before they break out" actionLabel="Full charts" actionTo="/Charts" />
        {fresh === null ? (
          <TrackListSkeleton rows={6} />
        ) : (
          <ol className="divide-y divide-white/5">
            {fresh.map((track, i) => (
              <TrackRow key={track.id} track={track} queue={fresh} index={i + 1} />
            ))}
          </ol>
        )}
      </section>

      <section aria-label="Artists to follow">
        <SectionHeader title="Artists to Follow" subtitle="New voices worth your ears" actionLabel="Browse" actionTo="/Browse" />
        {artists === null ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="size-full aspect-square rounded-full bg-white/10" />
                <div className="h-3 w-2/3 mx-auto bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {artists.map((artist) => {
              const following = library.isFollowing(artist.id)
              return (
                <div key={artist.id} className="group text-center">
                  <div className="relative mx-auto size-full aspect-square rounded-full overflow-hidden border border-white/10 mb-2">
                    {artist.artwork ? (
                      <img src={artist.artwork} alt={artist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center bg-white/10 text-2xl font-extrabold text-white/60">
                        {artist.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground truncate">{artist.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {artist.followers ? `${artist.followers} followers` : 'Artist'}
                  </p>
                  <button
                    onClick={() => library.toggleFollow(artist)}
                    className={`mt-2 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      following
                        ? 'bg-[#1ED760]/15 text-[#1ED760] border border-[#1ED760]/40'
                        : 'border border-white/20 text-foreground hover:border-[#1ED760] hover:text-[#1ED760]'
                    }`}
                  >
                    {following ? <CheckCircle2 size={13} /> : <UserPlus size={13} />}
                    {following ? 'Following' : 'Follow'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section aria-label="Trending now">
        <SectionHeader title="Trending Everywhere" subtitle="The tracks moving fastest today" actionLabel="Full charts" actionTo="/Charts" />
        {trending === null ? (
          <TrackListSkeleton rows={6} />
        ) : (
          <ol className="divide-y divide-white/5">
            {trending.map((track, i) => (
              <TrackRow key={track.id} track={track} queue={trending} index={i + 1} />
            ))}
          </ol>
        )}
      </section>

      {library.recent.length > 0 && (
        <section aria-label="Recently played">
          <SectionHeader title="Recently Played" subtitle="Pick up where you left off" actionLabel="Favorites" actionTo="/Favorites" />
          <ol className="divide-y divide-white/5">
            {library.recent.slice(0, 8).map((track, i) => (
              <TrackRow key={`recent-${track.id}`} track={track} queue={library.recent} index={i + 1} />
            ))}
          </ol>
        </section>
      )}

      <div className="flex items-center gap-3 rounded-2xl border border-[#1ED760]/30 bg-[#1ED760]/10 p-5">
        <Sparkles size={20} className="text-[#1ED760] shrink-0" />
        <p className="text-sm text-foreground">
          <span className="font-bold">Tip:</span> heart any track and it shows up in your Favorites, ready to play offline
          from your Library.
        </p>
      </div>
    </div>
  )
}
