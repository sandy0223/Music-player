'use client'
import React from 'react'
import { Settings, User, Database, Bell, Palette, Trash2, Sparkles } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { useLibrary } from '@/context/LibraryContext'
import { usePlayer } from '@/context/PlayerContext'
import { useToast } from '@/context/ToastContext'

const STORE_KEYS = [
  'sonara:favorites',
  'sonara:downloads',
  'sonara:playlists',
  'sonara:artists',
  'sonara:recent',
  'sonara:volume',
  'sonara:muted',
  'sonara:shuffle',
  'sonara:repeat',
]

export default function SettingsPage() {
  const { toast } = useToast()
  const { favorites, playlists, downloads, artists } = useLibrary()
  const { volume, setVolume, stop } = usePlayer()

  const clearData = () => {
    const count = favorites.length + playlists.length + downloads.length + artists.length
    if (count > 0 && !window.confirm(`Delete ${count} saved items and all playback settings?`)) return
    STORE_KEYS.forEach((k) => window.localStorage.removeItem(k))
    stop()
    toast('Local data cleared', { desc: 'Reload to see an empty library.', variant: 'success' })
    window.setTimeout(() => window.location.reload(), 800)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title="Settings" subtitle="Account, playback and data controls" />

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground mb-4">
          <User size={16} className="text-[#1ED760]" /> Account
        </h2>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="size-14 shrink-0 rounded-full bg-gradient-to-br from-[#1ED760] to-[#0ea5e9] p-[3px]">
            <span className="flex size-full items-center justify-center rounded-full bg-black text-sm font-bold text-white">
              AK
            </span>
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Alex Kim</p>
            <p className="text-xs text-muted-foreground">alex.kim@example.com · Free plan</p>
          </div>
          <button
            onClick={() =>
              toast('Premium waitlist joined', { desc: 'We will email you when checkout opens.', variant: 'success' })
            }
            className="ml-auto flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#1ED760] text-black text-xs font-bold hover:shadow-[0_0_24px_rgba(30,215,96,0.45)] transition-all cursor-pointer"
          >
            <Sparkles size={13} /> Upgrade
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground mb-4">
          <Settings size={16} className="text-[#1ED760]" /> Playback
        </h2>
        <label htmlFor="default-volume" className="flex items-center justify-between text-sm text-foreground mb-2">
          Default volume
          <span className="text-xs tabular-nums text-muted-foreground">{volume}%</span>
        </label>
        <input
          id="default-volume"
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-[#1ED760] cursor-pointer"
        />
        <p className="text-xs text-muted-foreground mt-3">
          Volume, shuffle and repeat preferences are remembered on this device.
        </p>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground mb-4">
          <Bell size={16} className="text-[#1ED760]" /> Notifications
        </h2>
        <div className="space-y-3">
          {['New releases from followed artists', 'Weekly Discovery digest', 'Product news'].map((label) => (
            <label key={label} className="flex items-center justify-between text-sm text-foreground cursor-pointer">
              {label}
              <input type="checkbox" defaultChecked className="size-4 accent-[#1ED760] cursor-pointer" />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground mb-2">
          <Database size={16} className="text-destructive" /> Data
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Favorites, playlists, downloads, follows and settings are stored locally in this browser. Clearing them cannot
          be undone.
        </p>
        <button
          onClick={clearData}
          className="flex items-center gap-2 h-10 px-5 rounded-full border border-destructive/60 text-xs font-bold uppercase tracking-wider text-destructive hover:bg-destructive hover:text-white transition-colors cursor-pointer"
        >
          <Trash2 size={14} /> Clear all local data
        </button>
      </section>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-xs text-muted-foreground">
        <Palette size={15} className="text-[#1ED760] shrink-0" />
        Sonara is dark-only for now — the theme matches the design system shipped with this build.
      </div>
    </div>
  )
}
