'use client'
import React, { useRef } from 'react'
import { Upload, Play, Trash2, FileAudio, Info } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { EmptyState } from '@/components/States'
import { useLibrary } from '@/context/LibraryContext'
import { usePlayer } from '@/context/PlayerContext'
import { useToast } from '@/context/ToastContext'
import { fmtTime } from '@/lib/format'
import type { Track } from '@/lib/freetouse'

export default function UploadsPage() {
  const { uploads, addUpload } = useLibrary()
  const { playQueue, current, isPlaying } = usePlayer()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const accepted = useRef<Track[]>([])

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const audio = Array.from(files).filter(
      (f) => f.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(f.name),
    )
    if (audio.length === 0) {
      toast('No audio files found', { desc: 'Only mp3, m4a, wav, ogg, flac and aac are supported.', variant: 'error' })
      return
    }
    const added: Track[] = audio.map((file, i) => ({
      id: `local-${Date.now()}-${i}`,
      title: file.name.replace(/\.[^.]+$/, ''),
      artist: 'Your upload',
      artistId: '',
      artwork: '',
      url: URL.createObjectURL(file),
      duration: 0,
      isStreamable: true,
    }))
    accepted.current = [...accepted.current, ...added]
    added.forEach((t) => addUpload(t))
  }

  const removeUpload = (track: Track) => {
    URL.revokeObjectURL(track.url)
    accepted.current = accepted.current.filter((t) => t.id !== track.id)
    toast('Removed upload', { desc: track.title, variant: 'info' })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PageHeader title="Uploads" subtitle="Play your own audio files right in the browser" />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] py-14 px-6 text-center cursor-pointer hover:border-[#1ED760] hover:bg-[#1ED760]/5 transition-colors"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-[#1ED760]/15 text-[#1ED760]">
          <Upload size={26} />
        </span>
        <p className="text-sm font-bold text-foreground">Drop audio files here, or click to browse</p>
        <p className="text-xs text-muted-foreground">mp3 · m4a · wav · ogg · flac · aac</p>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
          aria-label="Choose audio files to upload"
        />
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <Info size={16} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Uploads play straight from your device using an object URL, so they last for this session only — nothing is
          sent to a server. Add them to a playlist to queue them up with your streaming tracks.
        </p>
      </div>

      <section aria-label="Uploaded files">
        <h2 className="text-xl font-extrabold tracking-tight mb-4">
          Your files {uploads.length > 0 && <span className="text-muted-foreground text-base">({uploads.length})</span>}
        </h2>
        {uploads.length === 0 ? (
          <EmptyState
            icon={<FileAudio size={22} />}
            title="No uploads yet"
            desc="Add a file above and it will show up here, ready to play."
          />
        ) : (
          <ul className="divide-y divide-white/5">
            {uploads.map((track) => {
              const isCurrent = current?.id === track.id
              return (
                <li
                  key={track.id}
                  onClick={() => playQueue(uploads, uploads.findIndex((t) => t.id === track.id))}
                  className="group flex items-center gap-4 py-2.5 px-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#1ED760]/30 to-[#6366f1]/40">
                    <FileAudio size={18} className="text-white/80" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold truncate ${isCurrent ? 'text-[#1ED760]' : 'text-foreground'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">Your upload · session-only</p>
                  </div>
                  <span className="hidden sm:block text-xs tabular-nums text-muted-foreground">
                    {track.duration > 0 ? fmtTime(track.duration) : '—'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeUpload(track)
                    }}
                    className="size-9 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label={`Remove ${track.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      playQueue(uploads, uploads.findIndex((t) => t.id === track.id))
                    }}
                    className="size-9 shrink-0 rounded-full bg-[#1ED760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:scale-105 cursor-pointer"
                    aria-label={`Play ${track.title}`}
                  >
                    {isCurrent && isPlaying ? (
                      <span className="text-[10px] font-black">▮▮</span>
                    ) : (
                      <Play size={15} className="fill-black ml-0.5" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
