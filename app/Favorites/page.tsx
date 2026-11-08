'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Play, Trash2, Heart } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import TrackRow from '@/components/TrackRow'
import { EmptyState } from '@/components/States'
import { useLibrary } from '@/context/LibraryContext'
import { usePlayer } from '@/context/PlayerContext'
import { useToast } from '@/context/ToastContext'

export default function FavoritesPage() {
  const router = useRouter()
  const { favorites, toggleFavorite } = useLibrary()
  const { playQueue } = usePlayer()
  const { toast } = useToast()

  const clearAll = () => {
    favorites.forEach((t) => toggleFavorite(t))
    toast('Favorites cleared', { variant: 'info' })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Favorites"
        subtitle={`${favorites.length} ${favorites.length === 1 ? 'track' : 'tracks'} you love`}
      >
        {favorites.length > 0 && (
          <>
            <button
              onClick={() => playQueue(favorites, 0)}
              className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#1ED760] text-black text-sm font-bold hover:shadow-[0_0_30px_rgba(30,215,96,0.5)] transition-all cursor-pointer"
            >
              <Play size={16} className="fill-black" /> Play all
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 h-10 px-5 rounded-full border border-white/20 text-sm font-bold text-foreground hover:border-destructive hover:text-destructive transition-colors cursor-pointer"
            >
              <Trash2 size={15} /> Clear
            </button>
          </>
        )}
      </PageHeader>

      {favorites.length === 0 ? (
        <EmptyState
          icon={<Heart size={22} />}
          title="No favorites yet"
          desc="Tap the heart on any track and it will live here — ready to play any time."
          actionLabel="Find music"
          onAction={() => router.push('/Browse')}
        />
      ) : (
        <ol className="divide-y divide-white/5">
          {favorites.map((track, i) => (
            <TrackRow key={track.id} track={track} queue={favorites} index={i + 1} />
          ))}
        </ol>
      )}
    </div>
  )
}
