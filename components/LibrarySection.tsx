'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, MoreHorizontal, Download, CheckCircle2, Plus, UserPlus, AudioWaveform } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { TrackListSkeleton, EmptyState, ErrorState } from './States'
import { useLibrary } from '@/context/LibraryContext'
import { usePlayer } from '@/context/PlayerContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib'
import {
  getPlaylistTracks,
  getArtistTracks,
  getTrendingPlaylists,
  getTopArtists,
  type Artist,
  type Playlist,
} from '@/lib/freetouse'

type LibType = 'Playlists' | 'Albums' | 'Artists' | 'Downloads'

const tabs: LibType[] = ['Playlists', 'Albums', 'Artists', 'Downloads']

interface Row {
  key: string
  title: string
  meta: string
  cover: string
  round?: boolean
  offline?: boolean
}

interface LibrarySectionProps {
  hideHeader?: boolean
}

export default function LibrarySection({ hideHeader = false }: LibrarySectionProps) {
  const router = useRouter()
  const library = useLibrary()
  const { playQueue, playTrack } = usePlayer()
  const { toast } = useToast()

  const [tab, setTab] = useState<LibType>('Playlists')
  const [albums, setAlbums] = useState<Playlist[] | null>(null)
  const [suggested, setSuggested] = useState<Artist[] | null>(null)
  const [error, setError] = useState(false)

  /* Albums tab: curated collections from the API. */
  const loadAlbums = useCallback(() => {
    setError(false)
    getTrendingPlaylists(8)
      .then(setAlbums)
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (tab === 'Albums' && albums === null) loadAlbums()
  }, [tab, albums, loadAlbums])

  /* Artists tab: followed artists, or suggestions to follow when empty. */
  useEffect(() => {
    if (tab === 'Artists' && library.artists.length === 0 && suggested === null) {
      getTopArtists(6)
        .then(setSuggested)
        .catch(() => setSuggested([]))
    }
  }, [tab, library.artists.length, suggested])

  const playAlbum = async (playlist: Playlist) => {
    try {
      const tracks = await getPlaylistTracks(playlist.id)
      if (tracks.length === 0) {
        toast('Nothing to play', { desc: `${playlist.title} is empty.`, variant: 'info' })
        return
      }
      playQueue(tracks, 0)
    } catch {
      toast('Could not load collection', { variant: 'error' })
    }
  }

  const playArtist = async (artist: Artist) => {
    try {
      const tracks = await getArtistTracks(artist.id, 25)
      if (tracks.length === 0) {
        toast('No tracks found', { desc: artist.name, variant: 'info' })
        return
      }
      playQueue(tracks, 0)
    } catch {
      toast('Could not load artist', { variant: 'error' })
    }
  }

  const handleCreate = () => {
    const name = window.prompt('Name your new playlist')
    if (name && name.trim()) {
      const pl = library.createPlaylist(name)
      router.push(`/Playlists?id=${pl.id}`)
    }
  }

  const renderRows = (rows: Row[], actions: (row: Row, index: number) => React.ReactNode) => (
    <ul className="divide-y divide-white/5">
      {rows.map((item, i) => (
        <li
          key={item.key}
          className="group flex items-center gap-3 sm:gap-4 py-2.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <span className="relative shrink-0">
            {item.cover ? (
              <img
                src={item.cover}
                alt={`${item.title} cover`}
                className={cn('size-11 object-cover', item.round ? 'rounded-full' : 'rounded-md')}
              />
            ) : (
              <span
                className={cn(
                  'flex size-11 items-center justify-center bg-gradient-to-br from-[#1ED760]/30 to-[#6366f1]/40',
                  item.round ? 'rounded-full' : 'rounded-md',
                )}
              >
                <AudioWaveform size={18} className="text-white/70" />
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate">{item.meta}</p>
          </div>
          {actions(item, i)}
        </li>
      ))}
    </ul>
  )

  const playButton = (onClick: () => void, label: string) => (
    <button
      onClick={onClick}
      className="size-9 shrink-0 rounded-full bg-[#1ED760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:scale-105 cursor-pointer"
      aria-label={`Play ${label}`}
    >
      <Play size={15} className="fill-black ml-0.5" />
    </button>
  )

  return (
    <section aria-label="Your library">
      {!hideHeader && (
        <SectionHeader
          title="Your Library"
          subtitle="Everything you have saved, in one place"
          actionLabel="Manage"
          actionTo="/Library"
        />
      )}
      <Tabs value={tab} onValueChange={(v) => setTab(v as LibType)}>
        <TabsList className="bg-white/5 rounded-full p-1 h-10 mb-4 w-full sm:w-auto justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="rounded-full px-4 h-8 text-sm font-semibold text-muted-foreground data-[state=active]:bg-white/15 data-[state=active]:text-white cursor-pointer whitespace-nowrap"
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Playlists */}
        <TabsContent key="Playlists" value="Playlists" className="mt-0">
          {library.playlists.length === 0 ? (
            <EmptyState
              title="No playlists yet"
              desc="Create your first playlist and it will show up here."
              actionLabel="Create playlist"
              onAction={handleCreate}
            />
          ) : (
            renderRows(
              library.playlists.map((p) => ({
                key: p.id,
                title: p.name,
                meta: `Playlist · ${p.tracks.length} ${p.tracks.length === 1 ? 'song' : 'songs'}`,
                cover: p.cover || p.tracks[0]?.artwork || '',
              })),
              (item) => (
                <>
                  {playButton(
                    () => {
                      const pl = library.playlists.find((p) => p.id === item.key)
                      if (!pl || pl.tracks.length === 0) {
                        toast('Playlist is empty', { variant: 'info' })
                        return
                      }
                      playQueue(pl.tracks, 0)
                    },
                    item.title,
                  )}
                  <button
                    onClick={() => router.push(`/Playlists?id=${item.key}`)}
                    className="size-9 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label={`More options for ${item.title}`}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </>
              ),
            )
          )}
        </TabsContent>

        {/* Albums (curated collections) */}
        <TabsContent key="Albums" value="Albums" className="mt-0">
          {error ? (
            <ErrorState message="Could not load collections." onRetry={loadAlbums} />
          ) : albums === null ? (
            <TrackListSkeleton rows={4} />
          ) : (
            renderRows(
              albums.map((a) => ({
                key: a.id,
                title: a.title,
                meta: `Collection · ${a.owner}${a.trackCount ? ` · ${a.trackCount} songs` : ''}`,
                cover: a.cover,
              })),
              (item) => {
                const album = albums.find((a) => a.id === item.key)!
                return playButton(() => void playAlbum(album), item.title)
              },
            )
          )}
        </TabsContent>

        {/* Artists */}
        <TabsContent key="Artists" value="Artists" className="mt-0">
          {library.artists.length > 0 ? (
            renderRows(
              library.artists.map((a) => ({
                key: a.id,
                title: a.name,
                meta: `Artist · ${a.followers ? `${a.followers} followers` : 'following'}`,
                cover: a.artwork,
                round: true,
              })),
              (item) => {
                const artist = library.artists.find((a) => a.id === item.key)!
                return (
                  <>
                    {playButton(() => void playArtist(artist), item.title)}
                    <button
                      onClick={() => library.toggleFollow(artist)}
                      className="size-9 shrink-0 rounded-full flex items-center justify-center text-[#1ED760] hover:bg-white/10 transition-colors cursor-pointer"
                      aria-label={`Unfollow ${artist.name}`}
                    >
                      <CheckCircle2 size={17} />
                    </button>
                  </>
                )
              },
            )
          ) : suggested === null ? (
            <TrackListSkeleton rows={3} />
          ) : suggested.length === 0 ? (
            <EmptyState title="No artists yet" desc="Follow artists from Discover and they will appear here." />
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2">
                Suggested artists
              </p>
              {renderRows(
                suggested.map((a) => ({
                  key: a.id,
                  title: a.name,
                  meta: `Artist · ${a.followers ? `${a.followers} followers` : 'follow for new tracks'}`,
                  cover: a.artwork,
                  round: true,
                })),
                (item) => {
                  const artist = suggested.find((a) => a.id === item.key)!
                  return (
                    <>
                      {playButton(() => void playArtist(artist), item.title)}
                      <button
                        onClick={() => library.toggleFollow(artist)}
                        className="size-9 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label={`Follow ${artist.name}`}
                      >
                        <UserPlus size={16} />
                      </button>
                    </>
                  )
                },
              )}
            </>
          )}
        </TabsContent>

        {/* Downloads */}
        <TabsContent key="Downloads" value="Downloads" className="mt-0">
          {library.downloads.length === 0 ? (
            <EmptyState
              icon={<Download size={22} />}
              title="Nothing downloaded"
              desc="Download tracks from any list to listen to them offline."
              actionLabel="Browse music"
              onAction={() => router.push('/Browse')}
            />
          ) : (
            renderRows(
              library.downloads.map((t) => ({
                key: t.id,
                title: t.title,
                meta: `Song · ${t.artist}`,
                cover: t.artwork,
                offline: true,
              })),
              (item) => {
                const track = library.downloads.find((t) => t.id === item.key)!
                return (
                  <>
                    {playButton(() => playTrack(track, library.downloads), item.title)}
                    <span className="size-9 shrink-0 flex items-center justify-center" aria-label="Available offline">
                      <CheckCircle2 size={17} className="text-[#1ED760]" />
                    </span>
                  </>
                )
              },
            )
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}
