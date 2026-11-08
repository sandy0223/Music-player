'use client'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search as SearchIcon, Play, UserPlus, CheckCircle2, AudioWaveform, Plus } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import TrackRow from '@/components/TrackRow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { EmptyState, TrackListSkeleton } from '@/components/States'
import { usePlayer } from '@/context/PlayerContext'
import { useLibrary } from '@/context/LibraryContext'
import { useToast } from '@/context/ToastContext'
import {
  searchTracks,
  searchArtists,
  searchPlaylists,
  getArtistTracks,
  getPlaylistTracks,
  type Artist,
  type Playlist,
  type Track,
} from '@/lib/freetouse'

function SearchContent() {
  const params = useSearchParams()
  const router = useRouter()
  const initial = params.get('q') ?? ''

  const [query, setQuery] = useState(initial)
  const [active, setActive] = useState(initial)
  const [tracks, setTracks] = useState<Track[] | null>(null)
  const [artists, setArtists] = useState<Artist[] | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null)
  const [loading, setLoading] = useState(false)

  const { playQueue } = usePlayer()
  const library = useLibrary()
  const { toast } = useToast()

  const runSearch = useCallback(async (q: string) => {
    const term = q.trim()
    setActive(term)
    if (!term) {
      setTracks(null)
      setArtists(null)
      setPlaylists(null)
      return
    }
    setLoading(true)
    try {
      const [t, a, p] = await Promise.all([
        searchTracks(term, 25),
        searchArtists(term, 8),
        searchPlaylists(term, 8),
      ])
      setTracks(t)
      setArtists(a)
      setPlaylists(p)
    } catch {
      setTracks([])
      setArtists([])
      setPlaylists([])
      toast('Search failed', { desc: 'Check your connection and try again.', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  /* Debounced search-as-you-type; keeps the URL in sync for sharing. */
  useEffect(() => {
    const t = window.setTimeout(() => {
      void runSearch(query)
      const trimmed = query.trim()
      const target = trimmed ? `/Search?q=${encodeURIComponent(trimmed)}` : '/Search'
      if (window.location.pathname + window.location.search !== target) {
        router.replace(target, { scroll: false })
      }
    }, 400)
    return () => window.clearTimeout(t)
  }, [query, runSearch, router])

  /* Pick up navigations from the top bar (same page, new q). */
  useEffect(() => {
    if (initial !== query) setQuery(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  const playArtist = async (artist: Artist) => {
    try {
      const list = await getArtistTracks(artist.id, 25)
      if (list.length === 0) {
        toast('No tracks found', { desc: artist.name, variant: 'info' })
        return
      }
      playQueue(list, 0)
    } catch {
      toast('Could not load artist', { variant: 'error' })
    }
  }

  const playList = async (pl: Playlist) => {
    try {
      const list = await getPlaylistTracks(pl.id)
      if (list.length === 0) {
        toast('Playlist is empty', { variant: 'info' })
        return
      }
      playQueue(list, 0)
    } catch {
      toast('Could not load playlist', { variant: 'error' })
    }
  }

  const noResults =
    !loading && active && tracks?.length === 0 && artists?.length === 0 && playlists?.length === 0

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Search" subtitle="Find tracks, artists and playlists across Sonara" />

      <div className="relative max-w-xl mb-6">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, playlists…"
          aria-label="Search"
          className="h-12 rounded-full bg-white/10 border-transparent pl-11 pr-4 text-sm text-white placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#1ED760] focus-visible:border-transparent"
        />
      </div>

      {!active ? (
        <EmptyState
          icon={<SearchIcon size={22} />}
          title="Start typing to search"
          desc="Try an artist, a song title, or a mood like “lo-fi”."
        />
      ) : loading && tracks === null ? (
        <TrackListSkeleton rows={8} />
      ) : noResults ? (
        <EmptyState title={`No results for “${active}”`} desc="Check the spelling or try a different keyword." />
      ) : (
        <Tabs defaultValue="tracks">
          <TabsList className="bg-white/5 rounded-full p-1 h-10 mb-4 w-full sm:w-auto justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsTrigger
              value="tracks"
              className="rounded-full px-3 sm:px-4 h-8 text-sm font-semibold text-muted-foreground data-[state=active]:bg-[#1ED760] data-[state=active]:text-black cursor-pointer whitespace-nowrap"
            >
              Tracks{tracks ? ` (${tracks.length})` : ''}
            </TabsTrigger>
            <TabsTrigger
              value="artists"
              className="rounded-full px-3 sm:px-4 h-8 text-sm font-semibold text-muted-foreground data-[state=active]:bg-[#1ED760] data-[state=active]:text-black cursor-pointer whitespace-nowrap"
            >
              Artists{artists ? ` (${artists.length})` : ''}
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="rounded-full px-3 sm:px-4 h-8 text-sm font-semibold text-muted-foreground data-[state=active]:bg-[#1ED760] data-[state=active]:text-black cursor-pointer whitespace-nowrap"
            >
              Playlists{playlists ? ` (${playlists.length})` : ''}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracks" className="mt-0">
            {tracks === null ? (
              <TrackListSkeleton rows={6} />
            ) : tracks.length === 0 ? (
              <EmptyState title="No tracks found" desc={`Nothing matched “${active}”.`} />
            ) : (
              <ol className="divide-y divide-white/5">
                {tracks.map((track, i) => (
                  <TrackRow key={track.id} track={track} queue={tracks} index={i + 1} />
                ))}
              </ol>
            )}
          </TabsContent>

          <TabsContent value="artists" className="mt-0">
            {artists === null ? (
              <TrackListSkeleton rows={4} />
            ) : artists.length === 0 ? (
              <EmptyState title="No artists found" desc={`Nothing matched “${active}”.`} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {artists.map((artist) => {
                  const following = library.isFollowing(artist.id)
                  return (
                    <div key={artist.id} className="group rounded-xl border border-white/5 bg-card p-4 text-center hover:bg-white/5 transition-colors">
                      <div className="mx-auto size-24 rounded-full overflow-hidden mb-3">
                        {artist.artwork ? (
                          <img src={artist.artwork} alt={artist.name} className="w-full h-full object-cover" />
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
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => void playArtist(artist)}
                          className="size-9 rounded-full bg-[#1ED760] text-black flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                          aria-label={`Play ${artist.name}`}
                        >
                          <Play size={15} className="fill-black ml-0.5" />
                        </button>
                        <button
                          onClick={() => library.toggleFollow(artist)}
                          className={`flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            following
                              ? 'bg-[#1ED760]/15 text-[#1ED760] border border-[#1ED760]/40'
                              : 'border border-white/20 text-foreground hover:border-[#1ED760] hover:text-[#1ED760]'
                          }`}
                        >
                          {following ? <CheckCircle2 size={13} /> : <UserPlus size={13} />}
                          {following ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists" className="mt-0">
            {playlists === null ? (
              <TrackListSkeleton rows={4} />
            ) : playlists.length === 0 ? (
              <EmptyState title="No playlists found" desc={`Nothing matched “${active}”.`} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map((pl) => (
                  <div key={pl.id} className="group rounded-xl border border-white/5 bg-card p-3 hover:bg-white/5 transition-colors">
                    <div className="relative mb-2 overflow-hidden rounded-lg aspect-square">
                      {pl.cover ? (
                        <img src={pl.cover} alt={`${pl.title} cover`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1ED760]/30 to-[#6366f1]/40">
                          <AudioWaveform size={30} className="text-white/70" />
                        </span>
                      )}
                      <button
                        onClick={() => void playList(pl)}
                        className="absolute bottom-2 right-2 size-10 rounded-full bg-[#1ED760] text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-105 cursor-pointer"
                        aria-label={`Play ${pl.title}`}
                      >
                        <Play size={16} className="fill-black ml-0.5" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">{pl.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{pl.owner}</p>
                    <button
                      onClick={() => {
                        void (async () => {
                          try {
                            const list = await getPlaylistTracks(pl.id)
                            if (list.length === 0) {
                              toast('Playlist is empty', { variant: 'info' })
                              return
                            }
                            const target = library.playlists[0] ?? library.createPlaylist(pl.title)
                            list.slice(0, 25).forEach((t) => library.addToPlaylist(target.id, t))
                            toast(`Saved to ${target.name}`, { variant: 'success' })
                          } catch {
                            toast('Could not import playlist', { variant: 'error' })
                          }
                        })()
                      }}
                      className="mt-2 flex items-center gap-1.5 h-8 w-full justify-center rounded-full border border-white/20 text-xs font-bold text-foreground hover:border-[#1ED760] hover:text-[#1ED760] transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> Save to library
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<TrackListSkeleton rows={8} />}>
      <SearchContent />
    </Suspense>
  )
}
