'use client'
import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  Shuffle,
  Repeat,
  Heart,
  AudioWaveform,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { usePlayer } from '@/context/PlayerContext'
import { useLibrary } from '@/context/LibraryContext'
import { cn, fmtTime } from '@/lib'

interface MobilePlayerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MobilePlayer({ open, onOpenChange }: MobilePlayerProps) {
  const {
    current,
    isPlaying,
    progress,
    duration,
    shuffle,
    repeat,
    togglePlay,
    next,
    prev,
    seek,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer()
  const { isFavorite, toggleFavorite } = useLibrary()

  const total = duration || current?.duration || 0
  const liked = current ? isFavorite(current.id) : false

  return (
    <>
      <button
        onClick={() => onOpenChange(true)}
        className="md:hidden fixed bottom-[84px] right-4 z-40 size-14 rounded-full bg-[#1ED760] text-black shadow-[0_8px_30px_rgba(30,215,96,0.45)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        aria-label="Open player"
      >
        {isPlaying && current ? (
          <Pause size={22} className="fill-black" />
        ) : (
          <Play size={22} className="fill-black ml-0.5" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="md:hidden fixed inset-0 z-[60] bg-gradient-to-b from-[#101510] to-black flex flex-col px-6 pb-10 pt-4"
            role="dialog"
            aria-label="Now playing"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => onOpenChange(false)}
                className="size-11 flex items-center justify-center rounded-full hover:bg-white/10 text-white cursor-pointer"
                aria-label="Close player"
              >
                <ChevronDown size={24} />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Now Playing</span>
              <button
                onClick={() => current && toggleFavorite(current)}
                disabled={!current}
                className={cn(
                  'size-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40',
                  liked ? 'text-[#1ED760]' : 'text-[#1ED760]/70',
                )}
                aria-label={liked ? 'Unlike song' : 'Like song'}
              >
                <Heart size={20} className={cn(liked && 'fill-[#1ED760]')} />
              </button>
            </div>

            {current?.artwork ? (
              <img
                src={current.artwork}
                alt={`${current.title} cover art`}
                className="mt-8 w-full max-w-sm mx-auto aspect-square rounded-2xl object-cover shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              />
            ) : (
              <div className="mt-8 w-full max-w-sm mx-auto aspect-square rounded-2xl bg-white/5 flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                <AudioWaveform size={56} className="text-white/25" />
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-xl font-extrabold text-white truncate">{current?.title ?? 'Nothing playing'}</p>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {current ? `${current.artist}${current.genre ? ` · ${current.genre}` : ''}` : 'Browse to start listening'}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-[11px] tabular-nums text-muted-foreground w-9 text-right">
                {fmtTime(progress)}
              </span>
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

            <div className="mt-4 flex items-center justify-center gap-7">
              <button
                onClick={toggleShuffle}
                className={cn('cursor-pointer transition-colors', shuffle ? 'text-[#1ED760]' : 'text-muted-foreground hover:text-white')}
                aria-label="Shuffle"
                aria-pressed={shuffle}
              >
                <Shuffle size={20} />
              </button>
              <button
                onClick={prev}
                disabled={!current}
                className="text-white cursor-pointer disabled:opacity-40"
                aria-label="Previous track"
              >
                <SkipBack size={28} className="fill-current" />
              </button>
              <button
                onClick={togglePlay}
                disabled={!current}
                className="size-16 rounded-full bg-[#1ED760] text-black flex items-center justify-center shadow-[0_0_30px_rgba(30,215,96,0.5)] active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={26} className="fill-black" />
                ) : (
                  <Play size={26} className="fill-black ml-1" />
                )}
              </button>
              <button
                onClick={next}
                disabled={!current}
                className="text-white cursor-pointer disabled:opacity-40"
                aria-label="Next track"
              >
                <SkipForward size={28} className="fill-current" />
              </button>
              <button
                onClick={cycleRepeat}
                className={cn(
                  'relative cursor-pointer transition-colors',
                  repeat !== 'off' ? 'text-[#1ED760]' : 'text-muted-foreground hover:text-white',
                )}
                aria-label={`Repeat: ${repeat}`}
              >
                <Repeat size={20} />
                {repeat === 'one' && (
                  <span className="absolute -top-1.5 -right-2 flex size-3.5 items-center justify-center rounded-full bg-[#1ED760] text-[8px] font-black text-black">
                    1
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
