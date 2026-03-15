import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getOptionalUser } from '@/lib/auth/middleware'
import { LoginForm } from './LoginForm'

export default async function LoginPage() {
  // If already logged in, redirect to home
  const user = await getOptionalUser()
  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="manga-panel p-10 max-w-md w-full text-center">
        <div className="mb-6">
          <span className="inline-block bg-[var(--manga-red)] text-white font-black text-2xl tracking-tighter uppercase px-2 py-1 -skew-x-3">
            Manga
          </span>
          <span className="font-bold text-xl ml-2 text-[var(--manga-black)]">
            Reader
          </span>
        </div>
        <p className="text-[var(--manga-black)] opacity-60 mb-8 text-sm">
          Sign in with your Microsoft account to start reading.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
