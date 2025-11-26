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
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Login to Manga Reader
        </h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
