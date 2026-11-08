'use client'
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Link } from '@/lib'
import {
  Home,
  Compass,
  ListMusic,
  Heart,
  Upload,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Plus,
  Play,
  Trash2,
} from 'lucide-react'
import { useLibrary } from '@/context/LibraryContext'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/lib'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { icon: Home, label: 'Home', to: '/Home' },
  { icon: Compass, label: 'Discover', to: '/Discover' },
  { icon: ListMusic, label: 'Playlists', to: '/Playlists' },
  { icon: Heart, label: 'Favorites', to: '/Favorites' },
  { icon: Upload, label: 'Uploads', to: '/Uploads' },
]

interface SidebarProps {
  expanded: boolean
  onToggle: () => void
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ expanded, onToggle, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { playlists, createPlaylist, deletePlaylist } = useLibrary()
  const { playQueue } = usePlayer()

  const isExpanded = mobileOpen || expanded
  const activePath = pathname === '/' ? '/Home' : pathname

  const handleCreate = () => {
    const name = window.prompt('Name your new playlist')
    if (name && name.trim()) {
      const pl = createPlaylist(name)
      router.push(`/Playlists?id=${pl.id}`)
    }
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 top-[70px] z-30 bg-black/60 md:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`glass fixed top-[70px] bottom-0 left-0 z-40 flex flex-col border-r border-white/10 transition-[width,transform] duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${expanded ? 'md:w-60' : 'md:w-[72px]'} w-60`}
        aria-label="Sidebar navigation"
      >
        <div
          className={`flex items-center h-14 shrink-0 ${
            isExpanded ? 'justify-between px-4' : 'md:justify-center md:px-0 px-4 justify-end'
          }`}
        >
          {isExpanded && (
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Library</span>
          )}
          <button
            onClick={onToggle}
            className="size-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
          </button>
        </div>

        <nav className="px-2 py-1 space-y-1 shrink-0" aria-label="Library menu">
          {navItems.map(({ icon: Icon, label, to }) => {
            const active = activePath === to
            return (
              <Link
                key={label}
                to={to}
                title={label}
                aria-current={active ? 'page' : undefined}
                onClick={onClose}
                className={cn(
                  'group relative flex items-center gap-3 h-11 rounded-lg transition-colors cursor-pointer',
                  active
                    ? 'bg-white/10 text-[#1ED760]'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5',
                  isExpanded ? 'px-3' : 'md:justify-center md:px-0 px-3',
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={2}
                  className="shrink-0 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(30,215,96,0.8)]"
                />
                <span className={cn('text-sm font-semibold whitespace-nowrap', isExpanded ? 'block' : 'hidden md:hidden')}>
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          {isExpanded && (
            <>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Playlists</span>
              <button
                onClick={handleCreate}
                className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Create playlist"
              >
                <Plus size={16} />
              </button>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {playlists.length === 0 ? (
            isExpanded && (
              <p className="px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                No playlists yet — tap <Plus size={11} className="inline -mt-0.5" /> to create one.
              </p>
            )
          ) : (
            playlists.map((p) => (
              <div
                key={p.id}
                className="group flex items-center rounded-lg transition-colors hover:bg-white/5"
              >
                <Link
                  to={`/Playlists?id=${p.id}`}
                  onClick={onClose}
                  className={cn(
                    'flex-1 flex items-center gap-3 min-w-0 h-11',
                    isExpanded ? 'px-3' : 'md:justify-center md:px-0 px-3',
                  )}
                >
                  <span className="size-2 rounded-full shrink-0 bg-white/20" aria-hidden="true" />
                  <span className={cn('min-w-0', isExpanded ? 'block' : 'hidden md:hidden')}>
                    <span className="block truncate text-sm font-medium text-foreground">{p.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {p.tracks.length} {p.tracks.length === 1 ? 'track' : 'tracks'}
                    </span>
                  </span>
                </Link>
                {isExpanded && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 size-8 mr-1 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                        aria-label={`Options for ${p.name}`}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        disabled={p.tracks.length === 0}
                        onSelect={() => playQueue(p.tracks, 0)}
                      >
                        <Play size={14} /> Play playlist
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        onSelect={() => deletePlaylist(p.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          )}
        </div>

        <div className={`pb-4 shrink-0 ${isExpanded ? 'px-4' : ''}`}>
          {isExpanded ? (
            <Link
              to="/Uploads"
              className="flex items-center justify-center gap-2 h-10 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider text-foreground hover:border-[#1ED760] hover:text-[#1ED760] transition-colors cursor-pointer"
            >
              <Upload size={14} /> New Upload
            </Link>
          ) : (
            <Link
              to="/Uploads"
              title="New Upload"
              className="hidden md:flex size-10 mx-auto items-center justify-center rounded-full border border-white/20 text-muted-foreground hover:border-[#1ED760] hover:text-[#1ED760] transition-colors cursor-pointer"
              aria-label="New upload"
            >
              <Upload size={16} />
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
