'use client'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Play, Plus, Trash2, ArrowLeft, Search, AudioWaveform, ListPlus } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import TrackRow from '@/components/TrackRow'
import { EmptyState, TrackListSkeleton, ErrorState } from '@/components/States'
import { Input } from '@/components/ui/input'
import { useLibrary, type UserPlaylist } from '@/context/LibraryContext'
import { usePlayer } from '@/context/PlayerContext'
import { useToast } from '@/context/ToastContext'
import { cn, fmtTime, searchTracks, getTrendingPlaylists, getPlaylistTracks, type Playlist, type Track } from '@/lib'

/* ----------------------------- list view ----------------------------- */

function PlaylistList() {
  const router = useRouter()
  const { playlists, createPlaylist, addToPlaylist } = useLibrary()
  const { playQueue } = usePlayer()
  const { toast } = useToast()
  const [suggestions, setSuggestions] = useState<Playlist[] | null>(null)

  useEffect(() => {
    getTrendingPlaylists(6)
      .then(setSuggestions)
      .catch(() => setSuggestions([]))
  }, [])

  const handleCreate = () => {
    const name = window.prompt('Name your new playlist')
    if (name && name.trim()) {
      const pl = createPlaylist(name)
      router.push(`/Playlists?id=${pl.id}`)
    }
  }

  const importPlaylist = async (pl: Playlist) => {
    try {
      const tracks = await getPlaylistTracks(pl.id)
      if (tracks.length === 0) {
        toast('Nothing to import', { variant: 'info' })
        return
      }
      const target = playlists[0] ?? createPlaylist(pl.title)
      tracks.slice(0, 25).forEach((t) => addToPlaylist(target.id, t))
      toast(`Imported into ${target.name}`, { desc: `${Math.min(tracks.length, 25)} tracks added`, variant: 'success' })
    } catch {
      toast('Could not import playlist', { variant: 'error' })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <PageHeader title="Playlists" subtitle="Build your own collections from anything you stream">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#1ED760] text-black text-sm font-bold hover:shadow-[0_0_30px_rgba(30,215,96,0.5)] transition-all cursor-pointer"
        >
          <Plus size={16} /> New playlist
        </button>
      </PageHeader>

      {playlists.length === 0 ? (
        <EmptyState
          icon={<ListPlus size={22} />}
          title="No playlists yet"
          desc="Create one now, or import a starter collection below."
          actionLabel="Create playlist"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => router.push(`/Playlists?id=${pl.id}`)}
              className="group rounded-xl bg-card border border-white/5 p-3 hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="relative mb-3 overflow-hidden rounded-lg aspect-square">
                {pl.cover ? (
                  <img src={pl.cover} alt={`${pl.name} cover`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1ED760]/30 to-[#6366f1]/40">
                    <AudioWaveform size={32} className="text-white/70" />
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (pl.tracks.length === 0) {
                      toast('Playlist is empty', { variant: 'info' })
                      return
                    }
                    playQueue(pl.tracks, 0)
                  }}
                  className="absolute bottom-2 right-2 size-10 rounded-full bg-[#1ED760] text-black flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 cursor-pointer"
                  aria-label={`Play ${pl.name}`}
                >
                  <Play size={16} className="fill-black ml-0.5" />
                </button>
              </div>
              <p className="text-sm font-bold text-foreground truncate">{pl.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pl.tracks.length} {pl.tracks.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>
          ))}
        </div>
      )}

      <section aria-label="Starter playlists">
        <h2 className="text-xl font-extrabold tracking-tight mb-1">Start from a collection</h2>
        <p className="text-sm text-muted-foreground mb-4">Import trending sets straight into your library.</p>
        {suggestions === null ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shrink-0 w-44 rounded-xl border border-white/5 p-3 space-y-3 animate-pulse">
                <div className="aspect-square rounded-lg bg-white/10" />
                <div className="h-3.5 w-3/4 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <ErrorState message="Could not load suggestions." onRetry={() => setSuggestions(null)} />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {suggestions.map((pl) => (
              <div key={pl.id} className="group shrink-0 w-44 rounded-xl bg-card border border-white/5 p-3 hover:bg-white/5 transition-all">
                <div className="relative mb-3 overflow-hidden rounded-lg aspect-square">
                  {pl.cover && <img src={pl.cover} alt={`${pl.title} cover`} className="w-full h-full object-cover" />}
                  <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => void importPlaylist(pl)}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-full bg-[#1ED760] text-black text-xs font-bold cursor-pointer"
                    >
                      <Plus size={13} /> Import
                    </button>
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground truncate">{pl.title}</p>
                <p className="text-xs text-muted-foreground truncate">{pl.owner}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

/* ---------------------------- detail view ---------------------------- */

function PlaylistDetail({ id }: { id: string }) {
  const router = useRouter()
  const { getPlaylist, removeFromPlaylist, deletePlaylist, addToPlaylist } = useLibrary()
  const { playQueue, current, isPlaying } = usePlayer()
  const { toast } = useToast()

  const playlist = getPlaylist(id)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[] | null>(null)
  const [searching, setSearching] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    setSearching(true)
    try {
      setResults(await searchTracks(q, 10))
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  /* Debounced search-as-you-type. */
  useEffect(() => {
    const t = window.setTimeout(() => void search(query), 350)
    return () => window.clearTimeout(t)
  }, [query, search])

  if (!playlist) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Playlist not found" subtitle="It may have been deleted." />
        <EmptyState
          title="Nothing here"
          desc="This playlist no longer exists in your library."
          actionLabel="Back to playlists"
          onAction={() => router.push('/Playlists')}
        />
      </div>
    )
  }

  const tracks = playlist.tracks
  const cover = playlist.cover || tracks[0]?.artwork || ''

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <button
        onClick={() => router.push('/Playlists')}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-[#1ED760] transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> All playlists
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
        <div className="size-40 sm:size-48 shrink-0 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          {cover ? (
            <img src={cover} alt={`${playlist.name} cover`} className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1ED760]/40 to-[#6366f1]/50">
              <AudioWaveform size={48} className="text-white/80" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Playlist</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground break-words">
            {playlist.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
            {tracks.length > 0 && ` · ${fmtTime(tracks.reduce((sum, t) => sum + (t.duration || 0), 0))} total`}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => tracks.length > 0 && playQueue(tracks, 0)}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 h-11 px-6 rounded-full bg-[#1ED760] text-black text-sm font-bold hover:shadow-[0_0_35px_rgba(30,215,96,0.5)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Play size={16} className="fill-black" /> Play
            </button>
            <button
              onClick={() => {
                deletePlaylist(playlist.id)
                router.push('/Playlists')
              }}
              className="flex items-center gap-2 h-11 px-5 rounded-full border border-white/20 text-sm font-bold text-foreground hover:border-destructive hover:text-destructive transition-colors cursor-pointer"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Add tracks */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <label htmlFor="add-tracks" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Add tracks
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="add-tracks"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search to add songs…"
            className="pl-10 bg-white/10 border-transparent text-white placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#1ED760]"
          />
        </div>
        {query.trim() !== '' && (
          <div className="mt-3">
            {searching || results === null ? (
              <p className="text-xs text-muted-foreground">Searching…</p>
            ) : results.length === 0 ? (
              <p className="text-xs text-muted-foreground">No matches for “{query}”.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {results.map((track) => {
                  const already = tracks.some((t) => t.id === track.id)
                  return (
                    <li key={track.id} className="flex items-center gap-3 py-2">
                      {track.artwork ? (
                        <img src={track.artwork} alt="" className="size-9 rounded object-cover shrink-0" />
                      ) : (
                        <span className="size-9 rounded bg-white/10" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-foreground truncate">{track.title}</span>
                        <span className="block text-xs text-muted-foreground truncate">{track.artist}</span>
                      </span>
                      <button
                        onClick={() => {
                          if (already) {
                            toast('Already in this playlist', { variant: 'info' })
                            return
                          }
                          addToPlaylist(playlist.id, track)
                        }}
                        disabled={already}
                        className={cn(
                          'flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold transition-colors cursor-pointer disabled:cursor-default',
                          already
                            ? 'bg-white/10 text-muted-foreground'
                            : 'bg-[#1ED760] text-black hover:shadow-[0_0_20px_rgba(30,215,96,0.45)]',
                        )}
                      >
                        <Plus size={13} /> {already ? 'Added' : 'Add'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Track list */}
      {tracks.length === 0 ? (
        <EmptyState
          title="This playlist is empty"
          desc="Search above to add your first track."
          actionLabel="Browse trending"
          onAction={() => router.push('/Browse')}
        />
      ) : (
        <ol className="divide-y divide-white/5">
          {tracks.map((track, i) => (
            <TrackRow
              key={`${track.id}-${i}`}
              track={track}
              queue={tracks}
              index={i + 1}
              showDuration
              trailing={
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFromPlaylist(playlist.id, track.id)
                  }}
                  className="size-9 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label={`Remove ${track.title} from ${playlist.name}`}
                >
                  <Trash2 size={15} />
                </button>
              }
            />
          ))}
        </ol>
      )}

      {current && tracks.some((t) => t.id === current.id) && (
        <p className="text-xs text-muted-foreground">
          Now playing from this playlist: <span className="text-[#1ED760] font-bold">{current.title}</span>
          {isPlaying ? ' · streaming' : ' · paused'}
        </p>
      )}
    </div>
  )
}

/* ------------------------------- page -------------------------------- */

function PlaylistsContent() {
  const params = useSearchParams()
  const id = params.get('id')
  return id ? <PlaylistDetail id={id} /> : <PlaylistList />
}

export default function PlaylistsPage() {
  return (
    <Suspense fallback={<TrackListSkeleton rows={6} />}>
      <PlaylistsContent />
    </Suspense>
  )
}
