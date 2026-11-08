import type { Metadata } from 'next'
import '../global.css'
import { ToastProvider } from '@/context/ToastContext'
import { PlayerProvider } from '@/context/PlayerContext'
import { LibraryProvider } from '@/context/LibraryContext'
import Shell from '@/components/Shell'

export const metadata: Metadata = {
  title: 'Sonara — Your Sound, Your Way',
  description: 'Unlimited streaming. Personalized for you.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ToastProvider>
          <PlayerProvider>
            <LibraryProvider>
              <Shell>{children}</Shell>
            </LibraryProvider>
          </PlayerProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
