'use client'
import React, { useState } from 'react'
import { Play, Radio as RadioIcon, Bolt, Heart, Dumbbell } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { usePlayer } from '@/context/PlayerContext'
import { useToast } from '@/context/ToastContext'
import { useLibrary } from '@/context/LibraryContext'
import { cn, getGenreTracks, getMoodTracks, type Track } from '@/lib'
import { fmtTime } from '@/lib/format'

interface Station {
  name: string
  desc: string
  kind: 'genre' | 'mood'
  value: string
  gradient: string
}

const stations: Station[] = [
  { name: 'Late Night Drive', desc: 'Synthwave & neon-soaked beats', kind: 'genre', value: 'Electronic', gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)' },
  { name: 'Hip-Hop Central', desc: 'Bars, beats and bass', kind: 'genre', value: 'HipHop', gradient: 'linear-gradient(135deg, #f59e0b, #b91c1c)' },
  { name: 'Lo-Fi Study', desc: 'Warm loops for deep work', kind: 'genre', value: 'Lo-Fi', gradient: 'linear-gradient(135deg, #22c55e, #059669)' },
  { name: 'Jazz Lounge', desc: 'Smooth after-hours sessions', kind: 'genre', value: 'Jazz', gradient: 'linear-gradient(135deg, #eab308, #b45309)' },
  { name: 'Indie Roads', desc: 'Fresh guitar-driven finds', kind: 'genre', value: 'Indie', gradient: 'linear-gradient(135deg, #a855f7, #ec4899)' },
  { name: 'Dance Floor', desc: 'Non-stop movement', kind: 'genre', value: 'Dance', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { name: 'Feel Good Radio', desc: 'Happy vibes on repeat', kind: 'mood', value: 'Happy', gradient: 'linear-gradient(135deg, #f97316, #eab308)' },
  { name: 'Slow Down', desc: 'Calm moods, soft edges', kind: 'mood', value: 'Calm', gradient: 'linear-gradient(135deg, #4f46e5, #1e1b4b)' },
]

export default function RadioPage() {
  const { playQueue, setRepeat, current, isPlaying } = usePlayer()
  const { toast } = useToast()
  const library = useLibrary()
  const [tuning, setTuning] = useState<string | null>(null)

  const tuneIn = async (station: Station) => {
    setTuning(station.name)
    try {
      const tracks: Track[] =
        station.kind === 'genre'
          ? await getGenreTracks(station.value, 40)
          : await getMoodTracks(station.value, 40)
      if (tracks.length === 0) {
        toast('Station is quiet', { desc: 'Nothing found — try another station.', variant: 'info' })
        return
      }
      setRepeat('all')
      playQueue(tracks, 0)
      toast(`Tuned into ${station.name}`, { desc: `${tracks.length} tracks, looping non-stop.`, variant: 'success' })
    } catch {
      toast('Could not tune in', { desc: 'The station failed to load.', variant: 'error' })
    } finally {
      setTuning(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <PageHeader title="Radio" subtitle="Stations that never stop — pick a vibe and let it roll">
        {current && (
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4">
            <span className="relative flex size-8 items-center justify-center rounded-full bg-[#1ED760]">
              <RadioIcon size={15} className="text-black" />
              {isPlaying && (
                <span className="absolute inset-0 rounded-full border-2 border-[#1ED760] animate-ping" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">On air</span>
              <span className="block truncate text-xs font-bold text-white max-w-[180px]">
                {current.title} · {current.artist}
              </span>
            </span>
          </div>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stations.map((station) => {
          const active = tuning === station.name
          return (
            <button
              key={station.name}
              onClick={() => void tuneIn(station)}
              disabled={!!tuning}
              className="group relative overflow-hidden rounded-2xl border border-white/10 p-5 h-44 flex flex-col justify-between items-start text-left transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.45)] cursor-pointer disabled:opacity-70"
              aria-label={`Play ${station.name} station`}
            >
              <span aria-hidden="true" className="absolute inset-0 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3" style={{ background: station.gradient }} />
              <span aria-hidden="true" className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
              <span className="relative z-10 flex size-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
                <RadioIcon size={18} className="text-white" />
              </span>
              <span className="relative z-10">
                <span className="block text-base font-extrabold text-white">{station.name}</span>
                <span className="block text-xs text-white/85 mt-0.5">{station.desc}</span>
              </span>
              <span className="absolute z-10 bottom-4 right-4 size-10 rounded-full bg-[#1ED760] text-black flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <Play size={16} className="fill-black ml-0.5" />
              </span>
              {active && (
                <span className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-xs font-bold uppercase tracking-widest text-[#1ED760]">
                  Tuning…
                </span>
              )}
            </button>
          )
        })}
      </div>

      <section aria-label="Station guide">
        <h2 className="text-xl font-extrabold tracking-tight mb-3">How Radio works</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Bolt, title: 'Infinite queue', desc: 'Every station loads a full set of tracks and loops them with repeat-all.' },
            { icon: Heart, title: 'Loves stick', desc: 'Heart a track mid-station and it lands in your Favorites instantly.' },
            { icon: Dumbbell, title: 'Any mood', desc: 'Switch stations any time — the queue swaps without losing your place.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Icon size={18} className="text-[#1ED760] mb-2" />
              <p className="text-sm font-bold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {library.recent.length > 0 && (
        <section aria-label="Recently played">
          <h2 className="text-xl font-extrabold tracking-tight mb-2">Jump back in</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {library.recent.slice(0, 10).map((track) => (
              <button
                key={track.id}
                onClick={() => playQueue(library.recent, library.recent.findIndex((t) => t.id === track.id))}
                className="group shrink-0 w-36 rounded-xl border border-white/5 bg-card p-2.5 text-left hover:bg-white/5 hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="relative mb-2 overflow-hidden rounded-lg aspect-square">
                  {track.artwork && <img src={track.artwork} alt="" className="w-full h-full object-cover" />}
                  <span className="absolute bottom-1.5 right-1.5 size-8 rounded-full bg-[#1ED760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={13} className="fill-black ml-0.5" />
                  </span>
                </div>
                <p className="text-xs font-bold truncate text-foreground">{track.title}</p>
                <p className="text-[11px] truncate text-muted-foreground">
                  {track.artist} · {fmtTime(track.duration)}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
