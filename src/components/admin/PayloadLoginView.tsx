'use client'

import React from 'react'

export default function PayloadLoginView() {
  return (
    <div className="manga-login">
      <div className="manga-login__card">
        <div style={{ marginBottom: '2rem' }}>
          <span className="manga-login__badge">Manga</span>
          <span className="manga-login__title">Admin</span>
        </div>
        <p className="manga-login__desc">
          Sign in with your Microsoft account to access the admin dashboard.
        </p>
        <a href="/api/auth/login?returnTo=/admin" className="manga-login__btn">
          <span className="manga-login__btn-text">Sign in with Microsoft</span>
        </a>
      </div>
    </div>
  )
}
