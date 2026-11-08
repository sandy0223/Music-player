'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Play, AudioWaveform } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { CardSkeleton, ErrorState } from './States'
import { usePlayer } from '@/context/PlayerContext'
import { useToast } from '@/context/ToastContext'
import { getPlaylistTracks, getTrendingPlaylists, type Playlist } from '@/lib/freetouse'

interface PlaylistCarouselProps {
  title?: string
  subtitle?: string
  actionLabel?: string
  actionTo?: string
}

export default function PlaylistCarousel({
  title = 'Made for You',
  subtitle = 'Mixes tuned to your listening history',
  actionLabel = 'Show all',
  actionTo = '/Browse',
}: PlaylistCarouselProps) {
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null)
  const [error, setError] = useState(false)
  const { playQueue } = usePlayer()
  const { toast } = useToast()

  const load = useCallback(() => {
    setError(false)
    setPlaylists(null)
    getTrendingPlaylists(10)
      .then(setPlaylists)
      .catch(() => setError(true))
  }, [])

  useEffect(load, [load])

  const openPlaylist = async (playlist: Playlist) => {
    try {
      const tracks = await getPlaylistTracks(playlist.id)
      if (tracks.length === 0) {
        toast('Nothing to play', { desc: `${playlist.title} has no tracks yet.`, variant: 'info' })
        return
      }
      playQueue(tracks, 0)
      toast(`Playing ${playlist.title}`, { desc: `${tracks.length} tracks`, variant: 'success' })
    } catch {
      toast('Could not load playlist', { variant: 'error' })
    }
  }

  return (
    <section aria-label="Made for you">
      <SectionHeader title={title} subtitle={subtitle} actionLabel={actionLabel} actionTo={actionTo} />
      <div className="relative">
        <div
          className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />
        {error ? (
          <ErrorState message="Could not load playlists." onRetry={load} />
        ) : playlists === null ? (
          <CardSkeleton count={7} />
        ) : (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {playlists.map((p) => (
              <div
                key={p.id}
                onClick={() => void openPlaylist(p)}
                className="group relative shrink-0 w-40 sm:w-44 snap-start rounded-xl bg-card border border-white/5 p-3 hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="relative mb-3 overflow-hidden rounded-lg aspect-square">
                  {p.cover ? (
                    <img
                      src={p.cover}
                      alt={`${p.title} playlist cover`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1ED760]/30 to-[#6366f1]/40">
                      <AudioWaveform size={34} className="text-white/70" />
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      void openPlaylist(p)
                    }}
                    className="absolute bottom-2 right-2 size-10 rounded-full bg-[#1ED760] text-black flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 cursor-pointer"
                    aria-label={`Play ${p.title}`}
                  >
                    <Play size={16} className="fill-black ml-0.5" />
                  </button>
                </div>
                <p className="text-sm font-bold text-foreground truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.desc || `By ${p.owner}`}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
