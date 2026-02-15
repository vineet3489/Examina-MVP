'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, FileText, MessageCircle, Grid3X3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/tests', icon: FileText, label: 'Tests' },
  { href: '/tutor', icon: MessageCircle, label: 'AI Tutor' },
  { href: '/flashcards', icon: Grid3X3, label: 'Cards' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
                isActive ? 'text-[#6C5CE7]' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
