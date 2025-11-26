import React from 'react'
import Link from 'next/link'
import { getOptionalUser } from '@/lib/auth/middleware'
import './globals.css'

export const metadata = {
  description: 'Manga Reader - Read your favorite manga',
  title: 'Manga Reader',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const user = await getOptionalUser()

  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--manga-gray)]">
        <header className="bg-[#1a1a1a] text-white sticky top-0 z-50 border-b-4 border-[var(--manga-red)]">
          <div className="container py-3">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                {/* Logo */}
                <Link
                  href="/"
                  className="group flex items-center gap-2"
                >
                  <span className="text-2xl font-black tracking-tighter uppercase bg-[var(--manga-red)] text-white px-2 py-1 transform -skew-x-3 inline-block group-hover:scale-105 transition-transform">
                    Manga
                  </span>
                  <span className="text-xl font-bold tracking-tight">
                    Reader
                  </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                  <Link
                    href="/"
                    className="px-3 py-1 text-sm font-bold uppercase tracking-wide hover:bg-[var(--manga-red)] transition-colors"
                  >
                    Discover
                  </Link>
                  <Link
                    href="/all"
                    className="px-3 py-1 text-sm font-bold uppercase tracking-wide hover:bg-[var(--manga-red)] transition-colors"
                  >
                    All Mangas
                  </Link>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <span className="text-sm opacity-70">
                      {user.email}
                    </span>
                    <form action="/logout" method="post">
                      <button
                        type="submit"
                        className="text-sm font-bold uppercase tracking-wide text-white hover:text-[var(--manga-red)] hover:underline transition-colors"
                      >
                        Logout
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-bold uppercase tracking-wide hover:text-[var(--manga-red)] transition-colors"
                  >
                    Login
                  </Link>
                )}
                <Link
                  href="/admin"
                  className="text-sm font-bold uppercase tracking-wide opacity-70 hover:opacity-100 transition-opacity"
                >
                  Admin
                </Link>
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
