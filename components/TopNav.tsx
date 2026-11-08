'use client'
import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Link } from '@/lib'
import {
  AudioWaveform,
  Search,
  Bell,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Sparkles,
  Library,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/context/ToastContext'

const navLinks = [
  { label: 'Home', to: '/Home' },
  { label: 'Browse', to: '/Browse' },
  { label: 'Radio', to: '/Radio' },
  { label: 'Charts', to: '/Charts' },
  { label: 'Genres', to: '/Genres' },
  { label: 'Library', to: '/Library' },
]

const notifications = [
  { id: 1, title: 'Your Daily Mix is ready', desc: 'Fresh tracks tuned to your taste.' },
  { id: 2, title: 'New release: Midnight Drive', desc: 'Aurora Vale just dropped a new album.' },
  { id: 3, title: '3 friends joined Sonara', desc: 'See what they are listening to.' },
]

interface TopNavProps {
  onMenuClick: () => void
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [unread, setUnread] = useState(true)

  const activePath = pathname === '/' ? '/Home' : pathname

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setSearchOpen(false)
    router.push(`/Search?q=${encodeURIComponent(q)}`)
  }

  const goSearch = (term: string) => {
    setSearchOpen(false)
    if (term.trim()) router.push(`/Search?q=${encodeURIComponent(term.trim())}`)
  }

  return (
    <header className="glass sticky top-0 z-50 h-[70px] rounded-b-2xl border-b border-white/10">
      <div className="h-full flex items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onMenuClick}
          className="md:hidden size-11 flex items-center justify-center rounded-full text-foreground hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/Home" className="flex items-center gap-2.5 shrink-0 group cursor-pointer">
          <span className="size-9 rounded-xl bg-gradient-to-br from-[#1ED760] via-[#14b8a6] to-[#6366f1] flex items-center justify-center shadow-[0_0_18px_rgba(30,215,96,0.4)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_rgba(30,215,96,0.7)]">
            <AudioWaveform size={20} className="text-black" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">Sonara</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              aria-current={activePath === link.to ? 'page' : undefined}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                activePath === link.to ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
          <form onSubmit={submitSearch} className="hidden md:block" role="search">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists…"
              aria-label="Search songs and artists"
              className="w-44 lg:w-60 h-10 rounded-full bg-white/10 border-transparent text-sm text-white placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#1ED760] focus-visible:border-transparent"
            />
          </form>
          <button
            className="md:hidden size-11 flex items-center justify-center rounded-full text-foreground hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          <DropdownMenu onOpenChange={(open) => open && setUnread(false)}>
            <DropdownMenuTrigger asChild>
              <button
                className="relative hidden min-[380px]:flex size-11 items-center justify-center rounded-full text-foreground hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={unread ? 'Notifications (unread)' : 'Notifications'}
              >
                <Bell size={20} />
                {unread && (
                  <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-[#1ED760]" aria-hidden="true" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-popover border-border text-popover-foreground">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="cursor-pointer flex-col items-start gap-0.5 py-2"
                  onSelect={() => toast(n.title, { desc: n.desc, variant: 'info' })}
                >
                  <span className="text-sm font-semibold text-white">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.desc}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="ml-1 size-10 rounded-full bg-gradient-to-br from-[#1ED760] to-[#0ea5e9] p-[2px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760]"
                aria-label="Open profile menu"
              >
                <span className="flex size-full items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                  AK
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-popover border-border text-popover-foreground">
              <DropdownMenuLabel>Alex Kim</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="cursor-pointer gap-2" onSelect={() => router.push('/Library')}>
                <User size={16} /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" onSelect={() => router.push('/Settings')}>
                <Settings size={16} /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-[#1ED760]"
                onSelect={() =>
                  toast('Premium waitlist joined', {
                    desc: 'We will email you when checkout opens.',
                    variant: 'success',
                  })
                }
              >
                <Sparkles size={16} /> Upgrade to Premium
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="cursor-pointer gap-2" onSelect={() => router.push('/Library')}>
                <Library size={16} /> Your Library
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onSelect={() => toast('Logged out', { desc: 'This is a demo — you stay signed in.', variant: 'info' })}
              >
                <LogOut size={16} /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="glass-panel md:hidden absolute inset-x-0 top-full rounded-b-2xl border-b border-white/10 p-3" role="search">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists…"
            aria-label="Search songs and artists"
            className="h-11 rounded-full bg-white/10 border-transparent text-white placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#1ED760]"
          />
        </form>
      )}
    </header>
  )
}
