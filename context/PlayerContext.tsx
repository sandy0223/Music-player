'use client'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useToast } from './ToastContext'
import type { Track } from '@/lib/freetouse'
import { fmtTime } from '@/lib/format'

export type RepeatMode = 'off' | 'all' | 'one'

interface PlayerContextValue {
  /** Currently loaded track (null before anything is played). */
  current: Track | null
  /** The active play queue. */
  queue: Track[]
  /** Position of `current` inside `queue`. */
  index: number
  isPlaying: boolean
  /** Playback position in seconds. */
  progress: number
  /** Track length in seconds. */
  duration: number
  /** 0 – 100. */
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode
  /** True while the audio element is buffering. */
  loading: boolean
  /** Last playback error, surfaced as a toast. */
  error: string | null

  playTrack: (track: Track, queue?: Track[]) => void
  playQueue: (tracks: Track[], startIndex?: number) => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  /** Force a repeat mode (used by Radio stations). */
  setRepeat: (mode: RepeatMode) => void
  stop: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

const LS = {
  volume: 'sonara:volume',
  muted: 'sonara:muted',
  shuffle: 'sonara:shuffle',
  repeat: 'sonara:repeat',
  recent: 'sonara:recent',
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
    /* quota / private mode — non-fatal */
  }
}

/** Remember the last 30 played tracks for the Library "Recently played" tab. */
export function pushRecent(track: Track) {
  const list = readLS<Track[]>(LS.recent, [])
  const next = [track, ...list.filter((t) => t.id !== track.id)].slice(0, 30)
  writeLS(LS.recent, next)
  window.dispatchEvent(new CustomEvent('sonara:recent'))
}

export function readRecent(): Track[] {
  return readLS<Track[]>(LS.recent, [])
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [current, setCurrent] = useState<Track | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(70)
  const [muted, setMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeatState] = useState<RepeatMode>('off')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Latest-value refs so the once-bound <audio> handlers never go stale. */
  const state = useRef({ queue, index, shuffle, repeat, current })
  useEffect(() => {
    state.current = { queue, index, shuffle, repeat, current }
  }, [queue, index, shuffle, repeat, current])

  /* Restore persisted settings once on the client. */
  useEffect(() => {
    setVolumeState(readLS(LS.volume, 70))
    setMuted(readLS(LS.muted, false))
    setShuffle(readLS(LS.shuffle, false))
    setRepeatState(readLS(LS.repeat, 'off'))
  }, [])

  /* Keep the audio element in sync with volume state. */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume / 100
    audio.muted = muted
  }, [volume, muted])

  const loadAndPlay = useCallback((track: Track) => {
    const audio = audioRef.current
    if (!audio) return
    setCurrent(track)
    setProgress(0)
    setDuration(track.duration || 0)
    setLoading(true)
    setError(null)
    pushRecent(track)
    audio.src = track.url
    audio.load()
    void audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // Autoplay can be blocked or the stream can fail — either way the
        // user stays in control of the big play button.
        setIsPlaying(false)
        setLoading(false)
      })
  }, [])

  /** Advance to the next queue item. `auto` means the track just ended. */
  const advance = useCallback((direction: 1 | -1, auto = false) => {
    const { queue: q, index: i, shuffle: sh, repeat: rp } = state.current
    if (q.length === 0) return

    let nextIndex: number
    if (direction === 1 && sh && q.length > 1) {
      // Shuffle: any track but the one that just finished.
      do {
        nextIndex = Math.floor(Math.random() * q.length)
      } while (nextIndex === i)
    } else {
      nextIndex = i + direction
    }

    if (nextIndex >= q.length) {
      if (rp === 'all' || !auto) nextIndex = 0
      else {
        // End of queue with repeat off: stop where we are.
        const audio = audioRef.current
        if (audio) {
          audio.pause()
          audio.currentTime = 0
        }
        setIsPlaying(false)
        setProgress(0)
        return
      }
    }
    if (nextIndex < 0) nextIndex = q.length - 1

    const track = q[nextIndex]
    setIndex(nextIndex)
    loadAndPlay(track)
  }, [loadAndPlay])

  /* Wire up the single <audio> element once. */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setProgress(audio.currentTime)
    const onLoadedMetadata = () => {
      setLoading(false)
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setLoading(true)
    const onPlaying = () => setLoading(false)
    const onEnded = () => {
      const { repeat: rp } = state.current
      if (rp === 'one') {
        audio.currentTime = 0
        void audio.play()
        return
      }
      advance(1, true)
    }
    const onError = () => {
      if (!audio.src) return
      setError('This track could not be streamed')
      setLoading(false)
      setIsPlaying(false)
      toast('Stream unavailable', { desc: 'Skipping to the next track…', variant: 'error' })
      // Skip broken tracks, but never loop forever on a dead queue.
      const { queue: q } = state.current
      if (q.length > 1) window.setTimeout(() => advance(1, true), 1200)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [advance, toast])

  const playTrack = useCallback(
    (track: Track, newQueue?: Track[]) => {
      if (newQueue && newQueue.length > 0) {
        const idx = Math.max(0, newQueue.findIndex((t) => t.id === track.id))
        setQueue(newQueue)
        setIndex(idx)
        state.current.queue = newQueue
        state.current.index = idx
        loadAndPlay(newQueue[idx])
        return
      }
      // Same track already loaded → treat the call as play/pause.
      if (state.current.current?.id === track.id && audioRef.current?.src) {
        const audio = audioRef.current
        if (audio.paused) void audio.play()
        else audio.pause()
        return
      }
      const q = [track]
      setQueue(q)
      setIndex(0)
      state.current.queue = q
      state.current.index = 0
      loadAndPlay(track)
    },
    [loadAndPlay],
  )

  const playQueue = useCallback(
    (tracks: Track[], startIndex = 0) => {
      if (tracks.length === 0) return
      const idx = Math.min(Math.max(0, startIndex), tracks.length - 1)
      setQueue(tracks)
      setIndex(idx)
      state.current.queue = tracks
      state.current.index = idx
      loadAndPlay(tracks[idx])
    },
    [loadAndPlay],
  )

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !state.current.current) return
    if (audio.paused) {
      void audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [])

  const next = useCallback(() => advance(1), [advance])
  const prev = useCallback(() => {
    const audio = audioRef.current
    // Standard behaviour: restart the track unless we're near the start.
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setProgress(0)
      return
    }
    advance(-1)
  }, [advance])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(seconds)) return
    audio.currentTime = Math.max(0, seconds)
    setProgress(audio.currentTime)
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(100, Math.max(0, v))
    setVolumeState(clamped)
    writeLS(LS.volume, clamped)
    if (clamped > 0) setMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      writeLS(LS.muted, !m)
      return !m
    })
  }, [])

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      writeLS(LS.shuffle, !s)
      return !s
    })
  }, [])

  const cycleRepeat = useCallback(() => {
    setRepeatState((r) => {
      const nextMode: RepeatMode = r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'
      writeLS(LS.repeat, nextMode)
      return nextMode
    })
  }, [])

  const setRepeat = useCallback((mode: RepeatMode) => {
    setRepeatState(mode)
    writeLS(LS.repeat, mode)
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    setCurrent(null)
    setQueue([])
    setIndex(0)
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
  }, [])

  const value = useMemo<PlayerContextValue>(
    () => ({
      current,
      queue,
      index,
      isPlaying,
      progress,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      loading,
      error,
      playTrack,
      playQueue,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      setRepeat,
      stop,
    }),
    [
      current,
      queue,
      index,
      isPlaying,
      progress,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      loading,
      error,
      playTrack,
      playQueue,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      setRepeat,
      stop,
    ],
  )

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* The single audio engine behind every player UI in the app. */}
      <audio ref={audioRef} preload="auto" className="hidden" aria-hidden="true" />
    </PlayerContext.Provider>
  )
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}

export { fmtTime }
