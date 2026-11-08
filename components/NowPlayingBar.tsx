'use client'
import React, { useEffect, useState } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  MonitorSpeaker,
  ListOrdered,
  Mic2,
  Heart,
  X,
  AudioWaveform,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { usePlayer } from '@/context/PlayerContext'
import { useLibrary } from '@/context/LibraryContext'
import { useToast } from '@/context/ToastContext'
import { cn, fmtTime } from '@/lib'

interface NowPlayingBarProps {
  onOpenPlayer?: () => void
}

type Panel = 'queue' | 'lyrics' | null

export default function NowPlayingBar({ onOpenPlayer }: NowPlayingBarProps) {
  const {
    current,
    queue,
    isPlaying,
    progress,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    playQueue,
  } = usePlayer()
  const { isFavorite, toggleFavorite } = useLibrary()
  const { toast } = useToast()
  const [panel, setPanel] = useState<Panel>(null)

  const total = duration || current?.duration || 0
  const liked = current ? isFavorite(current.id) : false

  /* Click-away + Escape close the popover panels. */
  useEffect(() => {
    if (!panel) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanel(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel])

  const togglePanel = (name: Exclude<Panel, null>) => setPanel((p) => (p === name ? null : name))

  return (
    <div className="glass fixed bottom-0 inset-x-0 z-40 hidden md:flex h-20 items-center gap-4 rounded-t-2xl border-t border-white/10 px-4 lg:px-6">
      {/* Queue & lyrics popovers float above the bar */}
      {panel === 'queue' && (
        <div className="absolute bottom-full right-4 mb-2 w-[340px] max-h-[55vh] overflow-y-auto rounded-xl glass-panel p-3">
          <div className="flex items-center justify-between mb-2 sticky -top-3 bg-[#0c110c] py-1">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Queue · {queue.length}
            </span>
            <button
              onClick={() => setPanel(null)}
              className="size-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-white cursor-pointer"
              aria-label="Close queue"
            >
              <X size={13} />
            </button>
          </div>
          {queue.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Nothing in the queue yet.</p>
          ) : (
            <ul className="space-y-0.5">
              {queue.map((track, i) => (
                <li
                  key={`${track.id}-${i}`}
                  onClick={() => {
                    playQueue(queue, i)
                    setPanel(null)
                  }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-white/5 transition-colors',
                    current?.id === track.id && 'bg-white/10',
                  )}
                >
                  <span className="w-4 text-right text-[11px] tabular-nums text-muted-foreground">{i + 1}</span>
                  {track.artwork ? (
                    <img src={track.artwork} alt="" className="size-8 rounded object-cover shrink-0" />
                  ) : (
                    <span className="size-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                      <AudioWaveform size={14} className="text-white/60" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-xs font-bold',
                        current?.id === track.id ? 'text-[#1ED760]' : 'text-white',
                      )}
                    >
                      {track.title}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">{track.artist}</span>
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">{fmtTime(track.duration)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {panel === 'lyrics' && (
        <div className="absolute bottom-full right-4 mb-2 w-[340px] max-h-[55vh] overflow-y-auto rounded-xl glass-panel p-4">
          <div className="flex items-center justify-between mb-3 sticky -top-4 bg-[#0c110c] py-1">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lyrics</span>
            <button
              onClick={() => setPanel(null)}
              className="size-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-white cursor-pointer"
              aria-label="Close lyrics"
            >
              <X size={13} />
            </button>
          </div>
          {current?.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{current.description}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              No lyrics available for {current?.title ?? 'this track'}.
            </p>
          )}
        </div>
      )}

      {/* Left: current track */}
      <div className="flex items-center gap-3 w-[26%] min-w-[200px]">
        {current?.artwork ? (
          <img src={current.artwork} alt={`${current.title} cover art`} className="size-12 rounded-lg object-cover" />
        ) : (
          <span className="flex size-12 items-center justify-center rounded-lg bg-white/10">
            <AudioWaveform size={20} className="text-white/50" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{current?.title ?? 'Nothing playing'}</p>
          <p className="text-xs text-muted-foreground truncate">
            {current ? `${current.artist}${current.genre ? ` · ${current.genre}` : ''}` : 'Pick a track to start'}
          </p>
        </div>
        <button
          onClick={() => current && toggleFavorite(current)}
          disabled={!current}
          className={cn(
            'ml-2 shrink-0 size-9 flex items-center justify-center rounded-full transition-colors cursor-pointer disabled:opacity-40',
            liked ? 'text-[#1ED760]' : 'text-muted-foreground hover:text-[#1ED760]',
          )}
          aria-label={liked ? 'Unlike song' : 'Like song'}
        >
          <Heart size={17} className={cn(liked && 'fill-[#1ED760]')} />
        </button>
      </div>

      {/* Centre: transport + seek */}
      <div className="flex-1 flex flex-col items-center gap-1.5 max-w-2xl mx-auto min-w-0">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={cn(
              'size-9 flex items-center justify-center rounded-full transition-colors cursor-pointer',
              shuffle ? 'text-[#1ED760]' : 'text-muted-foreground hover:text-white',
            )}
            aria-label="Shuffle"
            aria-pressed={shuffle}
          >
            <Shuffle size={17} />
          </button>
          <button
            onClick={prev}
            disabled={!current}
            className="size-9 flex items-center justify-center rounded-full text-foreground hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Previous track"
          >
            <SkipBack size={20} className="fill-current" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!current}
            className="size-10 rounded-full bg-[#1ED760] text-black flex items-center justify-center hover:scale-105 hover:shadow-[0_0_24px_rgba(30,215,96,0.6)] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black ml-0.5" />}
          </button>
          <button
            onClick={next}
            disabled={!current}
            className="size-9 flex items-center justify-center rounded-full text-foreground hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Next track"
          >
            <SkipForward size={20} className="fill-current" />
          </button>
          <button
            onClick={cycleRepeat}
            className={cn(
              'relative size-9 flex items-center justify-center rounded-full transition-colors cursor-pointer',
              repeat !== 'off' ? 'text-[#1ED760]' : 'text-muted-foreground hover:text-white',
            )}
            aria-label={`Repeat: ${repeat}`}
          >
            <Repeat size={17} />
            {repeat === 'one' && (
              <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-[#1ED760] text-[8px] font-black text-black">
                1
              </span>
            )}
          </button>
        </div>
        <div className="w-full flex items-center gap-2 group">
          <span className="text-[11px] tabular-nums text-muted-foreground w-9 text-right">{fmtTime(progress)}</span>
          <Slider
            value={[Math.min(progress, total)]}
            onValueChange={(v) => seek(v[0])}
            max={total || 1}
            step={1}
            aria-label="Seek"
            className="flex-1 cursor-pointer"
          />
          <span className="text-[11px] tabular-nums text-muted-foreground w-9">{fmtTime(total)}</span>
        </div>
      </div>

      {/* Right: volume + utilities */}
      <div className="flex items-center justify-end gap-1 w-[26%] min-w-[200px]">
        <button
          onClick={toggleMute}
          className="size-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-white transition-colors cursor-pointer"
          aria-label={volume === 0 || muted ? 'Unmute' : 'Mute'}
        >
          {volume === 0 || muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <Slider
          value={[muted ? 0 : volume]}
          onValueChange={(v) => setVolume(v[0])}
          max={100}
          step={1}
          aria-label="Volume"
          className="w-24 cursor-pointer"
        />
        <button
          onClick={() => toast('Playing on this computer', { desc: 'Device switching is coming soon.', variant: 'info' })}
          className="size-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-white transition-colors cursor-pointer"
          aria-label="Switch device"
        >
          <MonitorSpeaker size={18} />
        </button>
        <button
          onClick={() => togglePanel('queue')}
          className={cn(
            'size-9 flex items-center justify-center rounded-full transition-colors cursor-pointer',
            panel === 'queue' ? 'text-[#1ED760]' : 'text-muted-foreground hover:text-white',
          )}
          aria-label="Open queue"
          aria-expanded={panel === 'queue'}
        >
          <ListOrdered size={18} />
        </button>
        <button
          onClick={() => togglePanel('lyrics')}
          className={cn(
            'size-9 flex items-center justify-center rounded-full transition-colors cursor-pointer',
            panel === 'lyrics' ? 'text-[#1ED760]' : 'text-muted-foreground hover:text-white',
          )}
          aria-label="Toggle lyrics"
          aria-expanded={panel === 'lyrics'}
        >
          <Mic2 size={18} />
        </button>
      </div>
    </div>
  )
}
