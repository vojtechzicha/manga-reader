'use client'

import React from 'react'

export default function PayloadLoginView() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '3px solid #1a1a1a',
          boxShadow: '6px 6px 0 #1a1a1a',
          padding: '3rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <span
            style={{
              display: 'inline-block',
              background: '#e63946',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1.5rem',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              padding: '0.25rem 0.75rem',
              transform: 'skewX(-3deg)',
            }}
          >
            Manga
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.25rem',
              marginLeft: '0.5rem',
              color: '#1a1a1a',
            }}
          >
            Admin
          </span>
        </div>

        <p
          style={{
            color: '#666',
            marginBottom: '2rem',
            fontSize: '0.875rem',
          }}
        >
          Sign in with your Microsoft account to access the admin dashboard.
        </p>

        <a
          href="/api/auth/login?returnTo=/admin"
          style={{
            display: 'inline-block',
            background: '#e63946',
            color: '#ffffff',
            fontWeight: 700,
            padding: '0.75rem 1.5rem',
            border: '3px solid #1a1a1a',
            boxShadow: '4px 4px 0 #1a1a1a',
            transform: 'skewX(-5deg)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'skewX(-5deg) translate(-2px, -2px)'
            e.currentTarget.style.boxShadow = '6px 6px 0 #1a1a1a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'skewX(-5deg)'
            e.currentTarget.style.boxShadow = '4px 4px 0 #1a1a1a'
          }}
        >
          <span style={{ display: 'inline-block', transform: 'skewX(5deg)' }}>
            Sign in with Microsoft
          </span>
        </a>
      </div>
    </div>
  )
}
