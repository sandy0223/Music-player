'use client'
import React from 'react'
import { motion } from 'motion/react'
import { Play, Pause, TrendingUp, TrendingDown, Minus, AudioWaveform } from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'
import { cn, fmtTime } from '@/lib'
import type { Track } from '@/lib/freetouse'

/** Animated equalizer shown in place of the row index for the live track. */
function Equalizer() {
  return (
    <span className="flex h-3.5 items-end justify-end gap-[2px]" aria-label="Now playing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-[#1ED760]"
          style={{ height: '100%' }}
          initial={{ scaleY: 0.3 }}
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
        />
      ))}
    </span>
  )
}

export interface TrackRowProps {
  track: Track
  /** Queue to play when this row is clicked. Defaults to just this track. */
  queue?: Track[]
  /** Rank number shown on the left (1-based). */
  index?: number
  /** Chart movement indicator. */
  move?: 'up' | 'down' | 'same'
  /** Override the second line (defaults to artist · genre). */
  subtitle?: string
  /** Extra column on wide screens (e.g. play counts). */
  meta?: React.ReactNode
  /** Extra controls between the meta column and the duration. */
  trailing?: React.ReactNode
  showDuration?: boolean
  className?: string
}

export default function TrackRow({
  track,
  queue,
  index,
  move,
  subtitle,
  meta,
  trailing,
  showDuration = true,
  className,
}: TrackRowProps) {
  const { current, isPlaying, playTrack, togglePlay } = usePlayer()
  const isCurrent = current?.id === track.id
  const playingHere = isCurrent && isPlaying

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCurrent) togglePlay()
    else playTrack(track, queue)
  }

  return (
    <li
      onClick={() => (isCurrent ? togglePlay() : playTrack(track, queue))}
      className={cn(
        'group flex items-center gap-2 sm:gap-4 py-2.5 px-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer',
        isCurrent && 'bg-white/5',
        className,
      )}
    >
      {index !== undefined && (
        <span className="w-7 shrink-0 text-right text-base font-extrabold tabular-nums text-muted-foreground">
          {isCurrent && playingHere ? <Equalizer /> : index}
        </span>
      )}
      {move && (
        <span
          className="w-4 flex justify-center shrink-0"
          aria-label={move === 'up' ? 'Rising' : move === 'down' ? 'Falling' : 'No change'}
        >
          {move === 'up' && <TrendingUp size={14} className="text-[#1ED760]" />}
          {move === 'down' && <TrendingDown size={14} className="text-destructive" />}
          {move === 'same' && <Minus size={14} className="text-muted-foreground" />}
        </span>
      )}
      <div className="relative size-11 shrink-0">
        {track.artwork ? (
          <img src={track.artwork} alt={`${track.title} cover art`} className="size-11 rounded-md object-cover" />
        ) : (
          <span className="flex size-11 items-center justify-center rounded-md bg-gradient-to-br from-[#1ED760]/40 to-[#6366f1]/40">
            <AudioWaveform size={18} className="text-white/80" />
          </span>
        )}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center rounded-md bg-black/60 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
          aria-label={playingHere ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          {playingHere ? (
            <Pause size={16} className="fill-white text-white" />
          ) : (
            <Play size={16} className="fill-white text-white ml-0.5" />
          )}
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-bold truncate', isCurrent ? 'text-[#1ED760]' : 'text-foreground')}>
          {track.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {subtitle ?? `${track.artist}${track.genre ? ` · ${track.genre}` : ''}`}
        </p>
      </div>
      {meta && <span className="hidden lg:block text-xs tabular-nums text-muted-foreground">{meta}</span>}
      {trailing}
      {showDuration && (
        <span className="hidden sm:block text-xs tabular-nums text-muted-foreground w-9 text-right">
          {fmtTime(track.duration)}
        </span>
      )}
      <button
        onClick={handlePlay}
        className={cn(
          'size-9 shrink-0 rounded-full bg-[#1ED760] text-black flex items-center justify-center transition-all hover:scale-105 cursor-pointer',
          playingHere
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
        )}
        aria-label={playingHere ? `Pause ${track.title}` : `Play ${track.title}`}
      >
        {playingHere ? <Pause size={15} className="fill-black" /> : <Play size={15} className="fill-black ml-0.5" />}
      </button>
    </li>
  )
}
