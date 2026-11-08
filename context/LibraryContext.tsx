'use client'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePlayer, pushRecent, readRecent } from './PlayerContext'
import { useToast } from './ToastContext'
import type { Artist, Track } from '@/lib/freetouse'

export interface UserPlaylist {
  id: string
  name: string
  cover: string
  tracks: Track[]
  createdAt: number
}

interface LibraryValue {
  favorites: Track[]
  downloads: Track[]
  recent: Track[]
  playlists: UserPlaylist[]
  artists: Artist[]

  isFavorite: (id: string) => boolean
  toggleFavorite: (track: Track) => void

  isDownloaded: (id: string) => boolean
  toggleDownload: (track: Track) => void

  createPlaylist: (name: string) => UserPlaylist
  deletePlaylist: (id: string) => void
  addToPlaylist: (playlistId: string, track: Track) => void
  removeFromPlaylist: (playlistId: string, trackId: string) => void
  getPlaylist: (id: string) => UserPlaylist | undefined

  isFollowing: (id: string) => boolean
  toggleFollow: (artist: Artist) => void

  /** Local uploads (session-only, played from object URLs). */
  uploads: Track[]
  addUpload: (track: Track) => void
}

const LibraryContext = createContext<LibraryValue | null>(null)

const LS = {
  favorites: 'sonara:favorites',
  downloads: 'sonara:downloads',
  playlists: 'sonara:playlists',
  artists: 'sonara:artists',
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function writeLS(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota errors */
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const { current } = usePlayer()

  const [favorites, setFavorites] = useState<Track[]>([])
  const [downloads, setDownloads] = useState<Track[]>([])
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [recent, setRecent] = useState<Track[]>([])
  const [uploads, setUploads] = useState<Track[]>([])

  /* Hydrate after mount — localStorage doesn't exist during SSR. */
  useEffect(() => {
    setFavorites(readLS<Track[]>(LS.favorites, []))
    setDownloads(readLS<Track[]>(LS.downloads, []))
    setPlaylists(readLS<UserPlaylist[]>(LS.playlists, []))
    setArtists(readLS<Artist[]>(LS.artists, []))
    setRecent(readRecent())
    const sync = () => setRecent(readRecent())
    window.addEventListener('sonara:recent', sync)
    return () => window.removeEventListener('sonara:recent', sync)
  }, [])

  /* Track listening history whenever the player moves on. */
  useEffect(() => {
    if (current) pushRecent(current)
  }, [current])

  const toggleFavorite = useCallback(
    (track: Track) => {
      setFavorites((prev) => {
        const exists = prev.some((t) => t.id === track.id)
        const next = exists ? prev.filter((t) => t.id !== track.id) : [track, ...prev]
        writeLS(LS.favorites, next)
        toast(exists ? 'Removed from Favorites' : 'Added to Favorites', {
          desc: `${track.title} · ${track.artist}`,
          variant: exists ? 'info' : 'success',
        })
        return next
      })
    },
    [toast],
  )

  const toggleDownload = useCallback(
    (track: Track) => {
      setDownloads((prev) => {
        const exists = prev.some((t) => t.id === track.id)
        if (exists) {
          const next = prev.filter((t) => t.id !== track.id)
          writeLS(LS.downloads, next)
          toast('Download removed', { desc: track.title, variant: 'info' })
          return next
        }
        toast('Downloading…', { desc: `${track.title} · ${track.artist}`, variant: 'info' })
        window.setTimeout(() => {
          setDownloads((cur) => {
            if (cur.some((t) => t.id === track.id)) return cur
            const next = [track, ...cur]
            writeLS(LS.downloads, next)
            toast('Available offline', { desc: track.title, variant: 'success' })
            return next
          })
        }, 1500)
        return prev
      })
    },
    [toast],
  )

  const createPlaylist = useCallback(
    (name: string) => {
      const playlist: UserPlaylist = {
        id: `pl-${Date.now()}`,
        name: name.trim() || 'New Playlist',
        cover: '',
        tracks: [],
        createdAt: Date.now(),
      }
      setPlaylists((prev) => {
        const next = [playlist, ...prev]
        writeLS(LS.playlists, next)
        return next
      })
      toast('Playlist created', { desc: playlist.name, variant: 'success' })
      return playlist
    },
    [toast],
  )

  const deletePlaylist = useCallback(
    (id: string) => {
      setPlaylists((prev) => {
        const next = prev.filter((p) => p.id !== id)
        writeLS(LS.playlists, next)
        return next
      })
      toast('Playlist deleted', { variant: 'info' })
    },
    [toast],
  )

  const addToPlaylist = useCallback(
    (playlistId: string, track: Track) => {
      setPlaylists((prev) => {
        const next = prev.map((p) =>
          p.id === playlistId && !p.tracks.some((t) => t.id === track.id)
            ? { ...p, tracks: [...p.tracks, track], cover: p.cover || track.artwork }
            : p,
        )
        writeLS(LS.playlists, next)
        const pl = next.find((p) => p.id === playlistId)
        toast('Added to playlist', { desc: `${track.title} → ${pl?.name ?? 'playlist'}`, variant: 'success' })
        return next
      })
    },
    [toast],
  )

  const removeFromPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      setPlaylists((prev) => {
        const next = prev.map((p) =>
          p.id === playlistId ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) } : p,
        )
        writeLS(LS.playlists, next)
        return next
      })
    },
    [],
  )

  const toggleFollow = useCallback(
    (artist: Artist) => {
      setArtists((prev) => {
        const exists = prev.some((a) => a.id === artist.id)
        const next = exists ? prev.filter((a) => a.id !== artist.id) : [artist, ...prev]
        writeLS(LS.artists, next)
        toast(exists ? `Unfollowed ${artist.name}` : `Following ${artist.name}`, {
          variant: exists ? 'info' : 'success',
        })
        return next
      })
    },
    [toast],
  )

  const addUpload = useCallback(
    (track: Track) => {
      setUploads((prev) => [track, ...prev])
      toast('Upload added', { desc: `${track.title} · ${track.artist}`, variant: 'success' })
    },
    [toast],
  )

  const value = useMemo<LibraryValue>(
    () => ({
      favorites,
      downloads,
      recent,
      playlists,
      artists,
      uploads,
      isFavorite: (id) => favorites.some((t) => t.id === id),
      toggleFavorite,
      isDownloaded: (id) => downloads.some((t) => t.id === id),
      toggleDownload,
      createPlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      getPlaylist: (id) => playlists.find((p) => p.id === id),
      isFollowing: (id) => artists.some((a) => a.id === id),
      toggleFollow,
      addUpload,
    }),
    [
      favorites,
      downloads,
      recent,
      playlists,
      artists,
      uploads,
      toggleFavorite,
      toggleDownload,
      createPlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      toggleFollow,
      addUpload,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary(): LibraryValue {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider')
  return ctx
}
